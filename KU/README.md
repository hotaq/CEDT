# AI Border Triage

Phase 1 workspace scaffold for:
- `services/backend` (API)
- `services/ai-service` (AI orchestration API)
- `services/frontend` (UI placeholder)
- `infra/db/schema.sql` (initial database schema)

## Quick Start
1. Copy env template
```bash
cp .env.example .env
```
2. Start local stack
```bash
docker compose up --build
```
3. Check health endpoints
- Backend: `http://localhost:8000/health`
- AI Service: `http://localhost:8100/health`

## Notes
- This is the Epic 1 starter scaffold.
- Replace frontend placeholder with your chosen framework.
- Extend DB schema and migrations as implementation evolves.
- `ai-service` can proxy requests to your Med-Gemma server via ngrok (see `services/ai-service/README.md`).
