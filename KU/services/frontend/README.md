# Frontend Service (Doctor Dashboard MVP)

## Features
- Pages:
  - `/doctor` (Doctor Dashboard)
  - `/patient` (Patient Portal)
- Queue panel from `GET /triage/queue`
- Session detail from `GET /sessions/{session_id}`
- Actions:
  - `POST /sessions/{session_id}/ai-summary`
  - `POST /sessions/{session_id}/triage`
  - `POST /triage/{triage_result_id}/override`

## Run locally
```bash
cp .env.example .env
npm install
npm run dev
```

Default URL: `http://localhost:5173`
Recommended page URLs:
- `http://localhost:5173/doctor`
- `http://localhost:5173/patient`

## Environment
- `VITE_BACKEND_BASE_URL` (default: `http://localhost:8000`)

If backend is running on another host/port, update `.env` accordingly.
