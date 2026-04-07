import os
import json
import re
from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID, uuid4

import httpx
import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg.rows import dict_row
from psycopg.types.json import Json

app = FastAPI(title="AI Border Triage Backend", version="0.2.0")


class IntakeRequest(BaseModel):
    source_language: str = Field(min_length=2, max_length=20)
    initial_text: str = Field(min_length=1, max_length=4000)
    external_ref: str | None = Field(default=None, max_length=100)
    translated_language: str = Field(default="en", min_length=2, max_length=20)


class SessionMessageRequest(BaseModel):
    sender: Literal["patient", "ai", "staff"] = "patient"
    source_language: str = Field(min_length=2, max_length=20)
    source_text: str = Field(min_length=1, max_length=4000)
    translated_language: str | None = Field(default=None, min_length=2, max_length=20)


class GenerateSummaryRequest(BaseModel):
    endpoint: str | None = None
    timeout_sec: float | None = Field(default=None, gt=0)
    include_ai_messages: bool = True
    target_language: str = Field(default="en", min_length=2, max_length=20)


class GenerateTriageRequest(BaseModel):
    summary_log_id: UUID | None = None


class TriageOverrideRequest(BaseModel):
    final_level: Literal["Critical", "Urgent", "Moderate", "Mild"]
    reason: str = Field(min_length=3, max_length=2000)
    reviewed_by: UUID | None = None


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _cors_origins() -> list[str]:
    raw = _env(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [item.strip() for item in raw.split(",") if item.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _db_conn() -> psycopg.Connection:
    conninfo = (
        f"host={_env('POSTGRES_HOST', 'db')} "
        f"port={_env('POSTGRES_PORT', '5432')} "
        f"dbname={_env('POSTGRES_DB', 'ai_border_triage')} "
        f"user={_env('POSTGRES_USER', 'triage_user')} "
        f"password={_env('POSTGRES_PASSWORD', 'triage_pass')}"
    )
    try:
        return psycopg.connect(conninfo, row_factory=dict_row)
    except psycopg.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {exc}") from exc


def _translate_text(source_text: str, source_language: str, target_language: str) -> tuple[str, float]:
    if source_language.lower() == target_language.lower():
        return source_text, 1.0

    prompt = (
        "You are a medical translator for triage chat.\n"
        f"Translate from {source_language} to {target_language}.\n"
        "Return ONLY valid JSON with no markdown.\n"
        'Schema: {"translation":"string"}\n'
        "Do not explain.\n"
        f"Text:\n{source_text}"
    )

    base_url = _env("AI_SERVICE_BASE_URL", "http://ai-service:8100").rstrip("/")
    url = f"{base_url}/med-gemma/generate"
    timeout = float(_env("TRANSLATION_TIMEOUT_SEC", "20"))
    payload: dict[str, Any] = {"prompt": prompt}

    try:
        response = httpx.post(url, json=payload, timeout=timeout)
        response.raise_for_status()
        response_body = response.json()
        raw_text = str((response_body.get("data") or {}).get("response", "")).strip()
        candidate = ""

        if raw_text:
            # Prefer strict JSON extraction when the model follows format.
            try:
                parsed = _extract_json_object(raw_text)
                if isinstance(parsed, dict):
                    candidate = str(parsed.get("translation", "")).strip()
            except HTTPException:
                candidate = ""

        if not candidate and raw_text:
            # Fallback: simple key extraction if model returns loose text.
            match = re.search(r'"translation"\s*:\s*"([^"]+)"', raw_text, re.IGNORECASE)
            if match:
                candidate = match.group(1).strip()

        if not candidate and raw_text:
            lines = [line.strip().strip("\"'") for line in raw_text.splitlines() if line.strip()]
            if lines:
                candidate = lines[-1]

        if candidate:
            cleaned = _sanitize_control_chars(candidate)
            confidence = 0.9 if cleaned != source_text else 0.6
            return cleaned, confidence
    except Exception:
        pass

    # Safe fallback so chat still works if translation call fails.
    return source_text, 0.3


def _sanitize_control_chars(text: str) -> str:
    cleaned_chars: list[str] = []
    for ch in text:
        code = ord(ch)
        if code < 32 and ch not in ("\n", "\r", "\t"):
            cleaned_chars.append(" ")
        else:
            cleaned_chars.append(ch)
    return "".join(cleaned_chars)


def _jsonable(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, str):
        return _sanitize_control_chars(value)
    if isinstance(value, list):
        return [_jsonable(item) for item in value]
    if isinstance(value, tuple):
        return [_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _jsonable(val) for key, val in value.items()}
    return value


def _jsonable_row(row: dict[str, Any]) -> dict[str, Any]:
    return {key: _jsonable(value) for key, value in row.items()}


PLACEHOLDER_VALUES = {
    "",
    "string",
    "strings",
    "array",
    "object",
    "value",
    "values",
    "placeholder",
    "example",
    "n/a",
    "na",
    "none",
    "null",
}

TRIAGE_LEVEL_RANK = {"Mild": 1, "Moderate": 2, "Urgent": 3, "Critical": 4}


def _normalize_text_value(value: Any) -> str:
    return _sanitize_control_chars(str(value or "")).strip()


def _is_placeholder_text(value: Any) -> bool:
    text = _normalize_text_value(value).strip().lower().strip(" .,:;[](){}\"'")
    if text in PLACEHOLDER_VALUES:
        return True
    template_artifacts = [
        "mild|moderate|severe|critical|unknown",
        "critical|urgent|moderate|mild",
        "chief_complaint",
        "recommended_triage_level",
    ]
    return any(token in text for token in template_artifacts)


def _patient_texts(messages: list[dict[str, Any]]) -> list[str]:
    results: list[str] = []
    for msg in messages:
        if msg.get("sender") != "patient":
            continue
        candidate = str(msg.get("translated_text") or msg.get("source_text") or "").strip()
        if candidate:
            results.append(candidate)
    return results


def _infer_duration(text: str) -> str:
    match = re.search(r"(\d+\s*(?:minutes?|minute|min|hours?|hour|days?|day|นาที|ชั่วโมง|วัน))", text, re.IGNORECASE)
    if not match:
        return "unknown"
    return match.group(1)


def _infer_symptoms(text: str) -> list[str]:
    checks = [
        ("chest pain", ["chest pain", "เจ็บหน้าอก"]),
        ("shortness of breath", ["shortness of breath", "หายใจลำบาก"]),
        ("dizziness", ["dizziness", "เวียนหัว", "หน้ามืด"]),
        ("nausea", ["nausea", "คลื่นไส้"]),
        ("sweating", ["diaphoresis", "sweating", "เหงื่อออก"]),
        ("loss of consciousness", ["loss of consciousness", "หมดสติ"]),
        ("severe bleeding", ["severe bleeding", "เลือดออกมาก"]),
    ]
    lowered = text.lower()
    symptoms: list[str] = []
    for label, keywords in checks:
        if any(keyword in lowered for keyword in keywords):
            symptoms.append(label)
    return symptoms


def _infer_red_flags(text: str) -> list[str]:
    checks = [
        ("chest pain", ["chest pain", "เจ็บหน้าอก"]),
        ("shortness of breath", ["shortness of breath", "หายใจลำบาก"]),
        ("loss of consciousness", ["loss of consciousness", "หมดสติ"]),
        ("severe bleeding", ["severe bleeding", "เลือดออกมาก"]),
    ]
    lowered = text.lower()
    flags: list[str] = []
    for label, keywords in checks:
        if any(keyword in lowered for keyword in keywords):
            flags.append(label)
    return flags


def _infer_severity(text: str) -> str:
    lowered = text.lower()
    if any(token in lowered for token in ["critical", "วิกฤต", "หมดสติ", "severe bleeding", "เลือดออกมาก"]):
        return "critical"
    if any(token in lowered for token in ["severe", "รุนแรง", "มาก"]):
        return "severe"
    if any(token in lowered for token in ["mild", "เล็กน้อย"]):
        return "mild"
    if any(token in lowered for token in ["moderate", "ปานกลาง"]):
        return "moderate"
    return "unknown"


def _infer_triage_level(red_flags: list[str], severity: str) -> str:
    red_set = {item.lower() for item in red_flags}
    if "loss of consciousness" in red_set or "severe bleeding" in red_set:
        return "Critical"
    if "chest pain" in red_set and "shortness of breath" in red_set:
        return "Critical"
    if "chest pain" in red_set or "shortness of breath" in red_set:
        return "Urgent"
    if severity == "critical":
        return "Critical"
    if severity == "severe":
        return "Urgent"
    if severity == "mild":
        return "Mild"
    return "Moderate"


def _sanitize_string_list(value: Any) -> list[str]:
    items = value if isinstance(value, list) else [value]
    cleaned: list[str] = []
    for item in items:
        text = _normalize_text_value(item)
        if not text:
            continue
        if _is_placeholder_text(text):
            continue
        cleaned.append(text)
    deduped: list[str] = []
    seen: set[str] = set()
    for item in cleaned:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped


def _normalize_triage_level(value: Any) -> str:
    raw = _normalize_text_value(value)
    mapping = {
        "mild": "Mild",
        "moderate": "Moderate",
        "urgent": "Urgent",
        "critical": "Critical",
    }
    return mapping.get(raw.lower(), "Moderate")


def _apply_rule_based_triage(summary: dict[str, Any]) -> tuple[str, str, bool, list[dict[str, str]]]:
    model_level = _normalize_triage_level(summary.get("recommended_triage_level", "Moderate"))
    final_level = model_level
    triggered_rules: list[dict[str, str]] = []

    red_flags = {item.lower() for item in _sanitize_string_list(summary.get("red_flags", []))}
    symptoms = {item.lower() for item in _sanitize_string_list(summary.get("symptoms", []))}
    severity = _normalize_text_value(summary.get("severity", "unknown")).lower()

    def elevate(required_level: str, rule_id: str, reason: str) -> None:
        nonlocal final_level
        if TRIAGE_LEVEL_RANK[required_level] > TRIAGE_LEVEL_RANK[final_level]:
            final_level = required_level
        triggered_rules.append({"rule_id": rule_id, "required_level": required_level, "reason": reason})

    if "loss of consciousness" in red_flags or "loss of consciousness" in symptoms:
        elevate("Critical", "RF_LOSS_OF_CONSCIOUSNESS", "Loss of consciousness detected")
    if "severe bleeding" in red_flags or "severe bleeding" in symptoms:
        elevate("Critical", "RF_SEVERE_BLEEDING", "Severe bleeding detected")

    has_chest_pain = "chest pain" in red_flags or "chest pain" in symptoms
    has_sob = "shortness of breath" in red_flags or "shortness of breath" in symptoms
    if has_chest_pain and has_sob:
        elevate("Critical", "RF_CHEST_PAIN_PLUS_DYSPNEA", "Chest pain with shortness of breath")
    elif has_chest_pain or has_sob:
        elevate("Urgent", "RF_CARDIO_RESP_SYMPTOM", "Chest pain or shortness of breath present")

    if severity == "critical":
        elevate("Critical", "RF_SEVERITY_CRITICAL", "Severity marked as critical")
    elif severity == "severe":
        elevate("Urgent", "RF_SEVERITY_SEVERE", "Severity marked as severe")

    rule_override = final_level != model_level
    return model_level, final_level, rule_override, triggered_rules


def _extract_json_object(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()
    if not text:
        raise HTTPException(status_code=502, detail="AI service returned empty response")

    if "```json" in text:
        start = text.find("```json")
        end = text.find("```", start + 7)
        if start != -1 and end != -1:
            text = text[start + 7:end].strip()

    decoder = json.JSONDecoder()
    for idx, char in enumerate(text):
        if char != "{":
            continue
        try:
            parsed, _ = decoder.raw_decode(text[idx:])
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            continue

    raise HTTPException(
        status_code=502,
        detail="AI response did not contain valid JSON object",
    )


def _normalize_summary(summary: dict[str, Any], messages: list[dict[str, Any]]) -> dict[str, Any]:
    patient_texts = _patient_texts(messages)
    aggregate_text = " | ".join(patient_texts)

    chief_complaint = _normalize_text_value(summary.get("chief_complaint", ""))
    if _is_placeholder_text(chief_complaint):
        chief_complaint = patient_texts[0] if patient_texts else "unknown"

    symptoms = _sanitize_string_list(summary.get("symptoms", []))
    if not symptoms:
        symptoms = _infer_symptoms(aggregate_text)
    if not symptoms and patient_texts:
        symptoms = [patient_texts[0][:120]]

    duration = _normalize_text_value(summary.get("duration", "unknown"))
    if _is_placeholder_text(duration) or duration.lower() == "unknown":
        duration = _infer_duration(aggregate_text)

    severity = _normalize_text_value(summary.get("severity", "unknown")).lower()
    if _is_placeholder_text(severity):
        severity = "unknown"
    if severity == "unknown":
        severity = _infer_severity(aggregate_text)

    red_flags = _sanitize_string_list(summary.get("red_flags", []))
    if not red_flags:
        red_flags = _infer_red_flags(aggregate_text)

    recommended_triage_level = _normalize_text_value(summary.get("recommended_triage_level", "Moderate"))
    if _is_placeholder_text(recommended_triage_level):
        recommended_triage_level = _infer_triage_level(red_flags, severity)

    clinical_summary = _normalize_text_value(summary.get("clinical_summary", ""))
    if _is_placeholder_text(clinical_summary):
        symptom_str = ", ".join(symptoms) if symptoms else "unspecified symptoms"
        clinical_summary = (
            f"Patient presents with {symptom_str}. "
            f"Duration: {duration}. "
            f"Severity: {severity}."
        )

    normalized: dict[str, Any] = {
        "chief_complaint": chief_complaint,
        "symptoms": symptoms,
        "duration": duration or "unknown",
        "severity": severity or "unknown",
        "red_flags": red_flags,
        "recommended_triage_level": recommended_triage_level or "Moderate",
        "clinical_summary": clinical_summary,
    }

    allowed_severity = {"mild", "moderate", "severe", "critical", "unknown"}
    if normalized["severity"] not in allowed_severity:
        normalized["severity"] = "unknown"

    allowed_triage = {"Critical", "Urgent", "Moderate", "Mild"}
    if normalized["recommended_triage_level"] not in allowed_triage:
        normalized["recommended_triage_level"] = _infer_triage_level(
            normalized["red_flags"],
            normalized["severity"],
        )

    return normalized


def _build_summary_prompt(
    messages: list[dict[str, Any]],
    translated_language: str,
    target_language: str,
    include_ai_messages: bool,
) -> str:
    transcript_lines: list[str] = []
    for msg in messages:
        if not include_ai_messages and msg["sender"] == "ai":
            continue
        transcript_lines.append(
            (
                f"- sender={msg['sender']} "
                f"source_lang={msg['source_language']} "
                f"source_text={msg['source_text']} "
                f"translated_text={msg.get('translated_text') or ''}"
            )
        )

    transcript = "\n".join(transcript_lines) if transcript_lines else "- no messages"
    return (
        "You are a clinical triage assistant. "
        "Return ONLY valid JSON with no markdown.\n"
        "Do NOT output placeholders such as string, array, object, value, example.\n"
        "Use concrete values grounded in transcript evidence.\n"
        "Schema:\n"
        "{\n"
        '  "chief_complaint": "string",\n'
        '  "symptoms": ["string"],\n'
        '  "duration": "string",\n'
        '  "severity": "mild|moderate|severe|critical|unknown",\n'
        '  "red_flags": ["string"],\n'
        '  "recommended_triage_level": "Critical|Urgent|Moderate|Mild",\n'
        '  "clinical_summary": "string"\n'
        "}\n"
        "Rules: Use only evidence from transcript. If missing info, use unknown or empty list.\n"
        "Example output style (not content): "
        '{"chief_complaint":"Chest pain","symptoms":["Chest pain","Dizziness"],'
        '"duration":"30 minutes","severity":"moderate","red_flags":["chest pain"],'
        '"recommended_triage_level":"Urgent","clinical_summary":"Patient reports chest pain and dizziness for 30 minutes."}\n'
        f"Conversation translated language is {translated_language}; output language should be {target_language}.\n"
        f"Transcript:\n{transcript}"
    )


def _call_ai_service_generate(prompt: str, endpoint: str | None, timeout_sec: float | None) -> tuple[dict[str, Any], str]:
    base_url = _env("AI_SERVICE_BASE_URL", "http://ai-service:8100").rstrip("/")
    url = f"{base_url}/med-gemma/generate"
    timeout = timeout_sec or float(_env("AI_SERVICE_TIMEOUT_SEC", "90"))
    payload: dict[str, Any] = {"prompt": prompt}
    if endpoint:
        payload["endpoint"] = endpoint

    try:
        response = httpx.post(url, json=payload, timeout=timeout)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to connect AI service: {exc}") from exc

    try:
        response_body: dict[str, Any] = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"AI service returned non-JSON response: {response.text[:300]}") from exc

    if response.is_error:
        raise HTTPException(status_code=502, detail={"message": "AI service error", "response": response_body})

    ai_text = str((response_body.get("data") or {}).get("response", "")).strip()
    if not ai_text:
        raise HTTPException(status_code=502, detail="AI service response missing data.response")
    return response_body, ai_text


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "backend"}


@app.get("/triage/queue")
def get_triage_queue(include_inactive: bool = False, limit: int = 200) -> dict[str, Any]:
    safe_limit = min(max(limit, 1), 1000)
    status_condition = "" if include_inactive else "WHERE s.status = 'active'"

    query = f"""
    WITH latest_per_session AS (
        SELECT DISTINCT ON (tr.session_id)
            tr.id AS triage_result_id,
            tr.session_id,
            tr.final_level,
            tr.rule_override,
            tr.created_at
        FROM triage_results tr
        ORDER BY tr.session_id, tr.created_at DESC
    ),
    queue_rows AS (
        SELECT
            lps.triage_result_id,
            s.id AS session_id,
            s.patient_id,
            COALESCE(lps.final_level, 'Pending') AS final_level,
            COALESCE(lps.rule_override, FALSE) AS rule_override,
            COALESCE(lps.created_at, s.started_at) AS created_at
        FROM triage_sessions s
        LEFT JOIN latest_per_session lps ON lps.session_id = s.id
        {status_condition}
    )
    SELECT
        triage_result_id,
        session_id,
        patient_id,
        final_level,
        rule_override,
        created_at
    FROM queue_rows
    ORDER BY
        CASE final_level
            WHEN 'Critical' THEN 1
            WHEN 'Urgent' THEN 2
            WHEN 'Moderate' THEN 3
            WHEN 'Mild' THEN 4
            ELSE 5
        END ASC,
        created_at DESC
    LIMIT %s
    """

    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(query, (safe_limit,))
        rows = cur.fetchall()

    return {
        "count": len(rows),
        "include_inactive": include_inactive,
        "items": [_jsonable_row(row) for row in rows],
    }


@app.post("/intake")
def create_intake(request: IntakeRequest) -> dict[str, Any]:
    patient_id = uuid4()
    session_id = uuid4()
    message_id = uuid4()
    translated_text, confidence = _translate_text(
        source_text=request.initial_text,
        source_language=request.source_language,
        target_language=request.translated_language,
    )

    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO patients (id, external_ref, source_language)
            VALUES (%s, %s, %s)
            """,
            (patient_id, request.external_ref, request.source_language),
        )
        cur.execute(
            """
            INSERT INTO triage_sessions (id, patient_id, translated_language, status)
            VALUES (%s, %s, %s, 'active')
            """,
            (session_id, patient_id, request.translated_language),
        )
        cur.execute(
            """
            INSERT INTO triage_messages (
                id, session_id, sender, source_language, source_text, translated_text, translation_confidence
            )
            VALUES (%s, %s, 'patient', %s, %s, %s, %s)
            RETURNING id, session_id, sender, source_language, source_text, translated_text, translation_confidence, created_at
            """,
            (
                message_id,
                session_id,
                request.source_language,
                request.initial_text,
                translated_text,
                confidence,
            ),
        )
        message_row = cur.fetchone()
        cur.execute(
            """
            INSERT INTO triage_logs (id, session_id, event_type, payload)
            VALUES (%s, %s, %s, %s)
            """,
            (uuid4(), session_id, "session_created", Json({"patient_id": str(patient_id)})),
        )

    return {
        "patient_id": str(patient_id),
        "session_id": str(session_id),
        "translated_language": request.translated_language,
        "initial_message": _jsonable_row(message_row),
    }


@app.post("/sessions/{session_id}/message")
def add_session_message(session_id: UUID, request: SessionMessageRequest) -> dict[str, Any]:
    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, translated_language, status
            FROM triage_sessions
            WHERE id = %s
            """,
            (session_id,),
        )
        session_row = cur.fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="Session not found")

        translated_language = request.translated_language or session_row["translated_language"]
        translated_text, confidence = _translate_text(
            source_text=request.source_text,
            source_language=request.source_language,
            target_language=translated_language,
        )

        message_id = uuid4()
        cur.execute(
            """
            INSERT INTO triage_messages (
                id, session_id, sender, source_language, source_text, translated_text, translation_confidence
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, session_id, sender, source_language, source_text, translated_text, translation_confidence, created_at
            """,
            (
                message_id,
                session_id,
                request.sender,
                request.source_language,
                request.source_text,
                translated_text,
                confidence,
            ),
        )
        message_row = cur.fetchone()
        cur.execute(
            """
            INSERT INTO triage_logs (id, session_id, event_type, payload)
            VALUES (%s, %s, %s, %s)
            """,
            (
                uuid4(),
                session_id,
                "message_added",
                Json({"message_id": str(message_id), "sender": request.sender}),
            ),
        )

    return {"session_id": str(session_id), "message": _jsonable_row(message_row)}


@app.get("/sessions/{session_id}")
def get_session(session_id: UUID) -> dict[str, Any]:
    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                s.id AS session_id,
                s.patient_id,
                s.translated_language,
                s.status,
                s.started_at,
                s.ended_at,
                p.external_ref,
                p.source_language AS patient_source_language,
                p.created_at AS patient_created_at
            FROM triage_sessions s
            JOIN patients p ON p.id = s.patient_id
            WHERE s.id = %s
            """,
            (session_id,),
        )
        session_row = cur.fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="Session not found")

        cur.execute(
            """
            SELECT
                id, session_id, sender, source_language, source_text, translated_text,
                translation_confidence, created_at
            FROM triage_messages
            WHERE session_id = %s
            ORDER BY created_at ASC
            """,
            (session_id,),
        )
        message_rows = cur.fetchall()

        cur.execute(
            """
            SELECT
                id, session_id, model_level, final_level, rule_override, rationale,
                reviewed_by, reviewed_at, created_at
            FROM triage_results
            WHERE session_id = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (session_id,),
        )
        triage_row = cur.fetchone()

        cur.execute(
            """
            SELECT payload, created_at
            FROM triage_logs
            WHERE session_id = %s
              AND event_type = 'ai_summary_generated'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (session_id,),
        )
        summary_log_row = cur.fetchone()

    return {
        "session": _jsonable_row(session_row),
        "messages": [_jsonable_row(row) for row in message_rows],
        "latest_triage_result": _jsonable_row(triage_row) if triage_row else None,
        "latest_ai_summary": _jsonable_row(summary_log_row) if summary_log_row else None,
    }


@app.post("/sessions/{session_id}/ai-summary")
def generate_ai_summary(session_id: UUID, request: GenerateSummaryRequest) -> dict[str, Any]:
    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, translated_language, status
            FROM triage_sessions
            WHERE id = %s
            """,
            (session_id,),
        )
        session_row = cur.fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="Session not found")

        cur.execute(
            """
            SELECT
                id, sender, source_language, source_text, translated_text, created_at
            FROM triage_messages
            WHERE session_id = %s
            ORDER BY created_at ASC
            """,
            (session_id,),
        )
        message_rows = cur.fetchall()
        if not message_rows:
            raise HTTPException(status_code=400, detail="Cannot summarize empty session")

        prompt = _build_summary_prompt(
            messages=message_rows,
            translated_language=session_row["translated_language"],
            target_language=request.target_language,
            include_ai_messages=request.include_ai_messages,
        )
        ai_service_response, raw_response_text = _call_ai_service_generate(
            prompt=prompt,
            endpoint=request.endpoint,
            timeout_sec=request.timeout_sec,
        )
        safe_raw_response_text = _sanitize_control_chars(raw_response_text)
        parsed_summary = _extract_json_object(safe_raw_response_text)
        normalized_summary = _normalize_summary(parsed_summary, message_rows)

        log_id = uuid4()
        cur.execute(
            """
            INSERT INTO triage_logs (id, session_id, event_type, payload)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
            """,
            (
                log_id,
                session_id,
                "ai_summary_generated",
                Json(
                    {
                        "summary": normalized_summary,
                        "target_language": request.target_language,
                        "raw_response_text": safe_raw_response_text,
                        "ai_service_meta": {
                            "upstream_status": ai_service_response.get("upstream_status"),
                        },
                    }
                ),
            ),
        )
        insert_row = cur.fetchone()

    return {
        "session_id": str(session_id),
        "summary_log_id": str(insert_row["id"]),
        "created_at": _jsonable(insert_row["created_at"]),
        "summary": normalized_summary,
    }


@app.post("/sessions/{session_id}/triage")
def generate_triage_result(session_id: UUID, request: GenerateTriageRequest) -> dict[str, Any]:
    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT id
            FROM triage_sessions
            WHERE id = %s
            """,
            (session_id,),
        )
        session_row = cur.fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="Session not found")

        if request.summary_log_id:
            cur.execute(
                """
                SELECT id, payload, created_at
                FROM triage_logs
                WHERE id = %s
                  AND session_id = %s
                  AND event_type = 'ai_summary_generated'
                LIMIT 1
                """,
                (request.summary_log_id, session_id),
            )
        else:
            cur.execute(
                """
                SELECT id, payload, created_at
                FROM triage_logs
                WHERE session_id = %s
                  AND event_type = 'ai_summary_generated'
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (session_id,),
            )
        summary_row = cur.fetchone()
        if not summary_row:
            raise HTTPException(
                status_code=400,
                detail="No AI summary found. Call POST /sessions/{session_id}/ai-summary first.",
            )

        payload = summary_row.get("payload") or {}
        summary = payload.get("summary") if isinstance(payload, dict) else None
        if not isinstance(summary, dict):
            raise HTTPException(status_code=500, detail="Stored AI summary payload is invalid")

        model_level, final_level, rule_override, triggered_rules = _apply_rule_based_triage(summary)
        rationale = {
            "summary_log_id": str(summary_row["id"]),
            "model_level": model_level,
            "final_level": final_level,
            "rule_override": rule_override,
            "triggered_rules": triggered_rules,
            "summary_snapshot": summary,
        }

        triage_result_id = uuid4()
        cur.execute(
            """
            INSERT INTO triage_results (
                id, session_id, model_level, final_level, rule_override, rationale
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, session_id, model_level, final_level, rule_override, rationale, created_at
            """,
            (
                triage_result_id,
                session_id,
                model_level,
                final_level,
                rule_override,
                Json(rationale),
            ),
        )
        triage_row = cur.fetchone()

        cur.execute(
            """
            INSERT INTO triage_logs (id, session_id, event_type, payload)
            VALUES (%s, %s, %s, %s)
            """,
            (
                uuid4(),
                session_id,
                "triage_result_generated",
                Json(
                    {
                        "triage_result_id": str(triage_result_id),
                        "summary_log_id": str(summary_row["id"]),
                        "model_level": model_level,
                        "final_level": final_level,
                        "rule_override": rule_override,
                        "triggered_rules": triggered_rules,
                    }
                ),
            ),
        )

    return {
        "session_id": str(session_id),
        "triage_result": _jsonable_row(triage_row),
    }


@app.post("/triage/{triage_result_id}/override")
def override_triage_result(triage_result_id: UUID, request: TriageOverrideRequest) -> dict[str, Any]:
    with _db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                id, session_id, model_level, final_level, rule_override, rationale,
                reviewed_by, reviewed_at, created_at
            FROM triage_results
            WHERE id = %s
            LIMIT 1
            """,
            (triage_result_id,),
        )
        triage_row = cur.fetchone()
        if not triage_row:
            raise HTTPException(status_code=404, detail="Triage result not found")

        if request.reviewed_by:
            cur.execute(
                """
                SELECT id
                FROM medical_staff_accounts
                WHERE id = %s
                LIMIT 1
                """,
                (request.reviewed_by,),
            )
            staff_row = cur.fetchone()
            if not staff_row:
                raise HTTPException(status_code=400, detail="reviewed_by user not found in medical_staff_accounts")

        old_final_level = _normalize_triage_level(triage_row.get("final_level"))
        model_level = _normalize_triage_level(triage_row.get("model_level"))
        new_final_level = request.final_level

        old_rationale = triage_row.get("rationale")
        if not isinstance(old_rationale, dict):
            old_rationale = {}

        override_note = {
            "reason": _sanitize_control_chars(request.reason.strip()),
            "from_final_level": old_final_level,
            "to_final_level": new_final_level,
            "model_level": model_level,
            "reviewed_by": str(request.reviewed_by) if request.reviewed_by else None,
            "reviewed_at": datetime.utcnow().isoformat() + "Z",
        }
        updated_rationale = {
            **old_rationale,
            "doctor_override": override_note,
        }
        updated_rule_override = new_final_level != model_level

        cur.execute(
            """
            UPDATE triage_results
            SET
                final_level = %s,
                rule_override = %s,
                rationale = %s,
                reviewed_by = %s,
                reviewed_at = NOW()
            WHERE id = %s
            RETURNING
                id, session_id, model_level, final_level, rule_override, rationale,
                reviewed_by, reviewed_at, created_at
            """,
            (
                new_final_level,
                updated_rule_override,
                Json(updated_rationale),
                request.reviewed_by,
                triage_result_id,
            ),
        )
        updated_row = cur.fetchone()

        cur.execute(
            """
            INSERT INTO triage_logs (id, session_id, event_type, payload)
            VALUES (%s, %s, %s, %s)
            """,
            (
                uuid4(),
                triage_row["session_id"],
                "triage_result_overridden",
                Json(
                    {
                        "triage_result_id": str(triage_result_id),
                        "from_final_level": old_final_level,
                        "to_final_level": new_final_level,
                        "model_level": model_level,
                        "rule_override": updated_rule_override,
                        "reason": _sanitize_control_chars(request.reason.strip()),
                        "reviewed_by": str(request.reviewed_by) if request.reviewed_by else None,
                    }
                ),
            ),
        )

    return {
        "triage_result_id": str(triage_result_id),
        "triage_result": _jsonable_row(updated_row),
    }
