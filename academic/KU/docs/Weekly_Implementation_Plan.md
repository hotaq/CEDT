# AI Border Triage - Weekly Implementation Plan (Phase 1)

## Assumptions
- Start date: 2026-03-09
- Team size: 6 people (PM, Tech Lead, Backend, Frontend, AI/ML, QA)
- Scope: PRD Phase 1 (3 languages, text input, basic triage)

## Week-by-Week Plan

### Week 1: Kickoff + Technical Baseline
- Finalize architecture, tech stack, API contracts
- Define data model and triage event flow
- Set up repositories, branch strategy, CI baseline
- Deliverable: approved architecture + running CI pipeline

### Week 2: Data Layer + Service Skeletons
- Implement core DB schema (patients, encounters, triage_results, users, audit_logs)
- Scaffold backend service and AI service with health endpoints
- Configure local environment (`docker-compose` + `.env.example`)
- Deliverable: local stack boots successfully

### Week 3: Multilingual Input (UI + API)
- Build patient intake form (Thai/Burmese/Karen text input)
- Create backend endpoint for intake + validation
- Persist intake records and conversation session IDs
- Deliverable: end-to-end text intake to DB

### Week 4: Translation Layer Integration
- Integrate translation provider adapter
- Store source text + translated canonical text
- Add fallback strategy and error handling for low-confidence outputs
- Deliverable: translation pipeline with logs and confidence fields

### Week 5: AI Symptom Interview (Prompt v1)
- Implement follow-up question generation pipeline
- Add session memory for multi-turn interview
- Define guardrails for unsafe prompts/output
- Deliverable: AI can ask context-aware follow-up questions

### Week 6: Clinical Summary Generation
- Implement structured summary output (JSON schema)
- Add parsing/validation + failure recovery
- Start clinician-facing summary rendering in dashboard
- Deliverable: consistent `Clinical Summary` object from conversations

### Week 7: Rule-based Triage Engine (Safety First)
- Implement red-flag rules (chest pain, severe bleeding, LOC, etc.)
- Create rule override behavior and explainability fields
- Add unit tests for safety-critical rules
- Deliverable: deterministic safety triage layer in production path

### Week 8: ML Triage Classifier (Baseline)
- Build feature pipeline (symptoms, duration, severity)
- Train initial classifier and measure baseline performance
- Integrate hybrid decision logic (ML + rule override)
- Deliverable: hybrid triage decision endpoint

### Week 9: Medical Dashboard MVP
- Build queue view + risk level cards
- Add clinical summary panel and source/translated text panel
- Add doctor override action with audit trail
- Deliverable: usable dashboard for nurse/doctor workflow

### Week 10: Real-time Updates + Security
- Add queue real-time updates (SSE/WebSocket)
- Implement anonymization and access controls
- Add encryption-in-transit + key management checklist
- Deliverable: secure near-real-time dashboard behavior

### Week 11: Quality Gate + Performance
- Execute integration tests and UAT scripts
- Benchmark latency (`<3s` per response target)
- Tune prompts/feature thresholds based on test outcomes
- Deliverable: release candidate with test report

### Week 12: Pilot Readiness
- Conduct pilot simulation with clinical stakeholders
- Finalize SOPs, incident handling, rollback plan
- Freeze Phase 1 scope and prepare deployment package
- Deliverable: Phase 1 pilot-ready release

## Milestones
- M1 (Week 2): Platform Foundation Complete
- M2 (Week 6): AI Interview + Clinical Summary Complete
- M3 (Week 8): Hybrid Triage Engine Complete
- M4 (Week 10): Dashboard + Security Complete
- M5 (Week 12): Pilot Ready
