import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AI Border Triage AI Service", version="0.2.0")


class MedGemmaRequest(BaseModel):
    payload: Any
    endpoint: str | None = None
    timeout_sec: float | None = None


class PromptGenerateRequest(BaseModel):
    prompt: str
    endpoint: str | None = None
    timeout_sec: float | None = None


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _build_upstream_url(endpoint: str | None = None) -> str:
    if endpoint and endpoint.startswith(("http://", "https://")):
        return endpoint

    base_url = _env("MED_GEMMA_BASE_URL")
    default_path = _env("MED_GEMMA_ENDPOINT_PATH", "/v1/chat/completions")
    target_path = endpoint or default_path

    if not base_url:
        raise HTTPException(
            status_code=500,
            detail="MED_GEMMA_BASE_URL is not configured",
        )

    if not target_path.startswith("/"):
        target_path = f"/{target_path}"
    return f"{base_url.rstrip('/')}{target_path}"


def _build_headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    api_key = _env("MED_GEMMA_API_KEY")
    if not api_key:
        return headers

    header_name = _env("MED_GEMMA_API_KEY_HEADER", "Authorization")
    if header_name.lower() == "authorization" and not api_key.lower().startswith("bearer "):
        headers[header_name] = f"Bearer {api_key}"
    else:
        headers[header_name] = api_key
    return headers


@app.get("/health")
def health() -> dict[str, str]:
    configured = "yes" if _env("MED_GEMMA_BASE_URL") else "no"
    return {"status": "ok", "service": "ai-service", "upstream_configured": configured}


@app.get("/health/upstream")
def health_upstream() -> dict[str, Any]:
    base_url = _env("MED_GEMMA_BASE_URL")
    if not base_url:
        raise HTTPException(status_code=500, detail="MED_GEMMA_BASE_URL is not configured")

    health_path = _env("MED_GEMMA_HEALTH_PATH", "/health")
    url = f"{base_url.rstrip('/')}/{health_path.lstrip('/')}"
    timeout = float(_env("MED_GEMMA_TIMEOUT_SEC", "30"))

    try:
        response = httpx.get(url, timeout=timeout)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Upstream health check failed: {exc}") from exc

    return {
        "upstream_url": url,
        "status_code": response.status_code,
        "ok": response.is_success,
        "body_preview": response.text[:300],
    }


@app.post("/med-gemma/infer")
def med_gemma_infer(request: MedGemmaRequest) -> dict[str, Any]:
    url = _build_upstream_url(request.endpoint)
    timeout = request.timeout_sec or float(_env("MED_GEMMA_TIMEOUT_SEC", "60"))
    headers = _build_headers()

    try:
        response = httpx.post(url, json=request.payload, headers=headers, timeout=timeout)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to connect upstream: {exc}") from exc

    try:
        parsed_body: Any = response.json()
    except ValueError:
        parsed_body = {"raw_text": response.text}

    if response.is_error:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Upstream Med-Gemma API returned an error",
                "upstream_status": response.status_code,
                "upstream_body": parsed_body,
            },
        )

    return {"upstream_status": response.status_code, "data": parsed_body}


@app.post("/med-gemma/generate")
def med_gemma_generate(request: PromptGenerateRequest) -> dict[str, Any]:
    proxy_request = MedGemmaRequest(
        payload={"prompt": request.prompt},
        endpoint=request.endpoint,
        timeout_sec=request.timeout_sec,
    )
    return med_gemma_infer(proxy_request)
