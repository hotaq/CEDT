# AI Service

## Run locally (without Docker)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8100
```

## Connect to Med-Gemma over ngrok
Set these variables in `.env`:

```bash
MED_GEMMA_BASE_URL=https://<your-subdomain>.ngrok-free.app
MED_GEMMA_ENDPOINT_PATH=/generate
MED_GEMMA_HEALTH_PATH=/openapi.json
MED_GEMMA_API_KEY=
MED_GEMMA_API_KEY_HEADER=Authorization
MED_GEMMA_TIMEOUT_SEC=60
```

Notes:
- If `MED_GEMMA_API_KEY_HEADER=Authorization`, the service sends `Bearer <API_KEY>`.
- If your server uses another header (e.g. `x-api-key`), set that header name and the raw key value.

## API endpoints
- `GET /health` - local service health + upstream config state
- `GET /health/upstream` - ping upstream health path through ngrok
- `POST /med-gemma/infer` - forward request payload to upstream Med-Gemma API
- `POST /med-gemma/generate` - shortcut for upstream API expecting `{\"prompt\": \"...\"}`

### Example request
```bash
curl -X POST http://localhost:8100/med-gemma/infer \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "model": "med-gemma",
      "messages": [{"role":"user","content":"Patient has chest pain for 30 minutes"}]
    }
  }'
```

### Example request for your `/generate` API
```bash
curl -X POST http://localhost:8100/med-gemma/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Patient has chest pain and dizziness for 30 minutes"}'
```
