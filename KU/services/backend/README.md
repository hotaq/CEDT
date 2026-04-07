# Backend Service

## Run locally (without Docker)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment
- `POSTGRES_HOST` (default: `db` in Docker Compose)
- `POSTGRES_PORT` (default: `5432`)
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `AI_SERVICE_BASE_URL` (default: `http://ai-service:8100`)
- `AI_SERVICE_TIMEOUT_SEC` (default: `90`)

If you run backend directly on host while DB is in Docker, set:
- `POSTGRES_HOST=localhost`

## Endpoints (MVP Step 1)
- `GET /triage/queue`
  - Returns latest triage per session for dashboard queue
  - Sorted by urgency: `Critical` -> `Urgent` -> `Moderate` -> `Mild`, then newest first
  - Query: `include_inactive` (default `false`), `limit` (default `200`, max `1000`)
- `POST /intake`
  - Creates patient + session + first patient message
- `POST /sessions/{session_id}/message`
  - Appends a message (source text + translated text fields persisted)
- `GET /sessions/{session_id}`
  - Returns session metadata, conversation history, latest triage result, and latest AI summary log
- `POST /sessions/{session_id}/ai-summary`
  - Calls `ai-service` to generate structured clinical summary JSON from conversation
  - Persists summary under `triage_logs` event `ai_summary_generated`
- `POST /sessions/{session_id}/triage`
  - Reads latest (or specified) AI summary and applies rule-based safety override
  - Persists triage decision to `triage_results` and audit log event `triage_result_generated`
- `POST /triage/{triage_result_id}/override`
  - Doctor override for final triage level with reason
  - Updates `triage_results.final_level`, `rule_override`, `rationale`, `reviewed_by`, `reviewed_at`
  - Persists audit log event `triage_result_overridden`
