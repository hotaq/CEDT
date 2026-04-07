# AI Border Triage - Phase 1 Backlog (Priority, Owner, ETA)

## Owner Roles
- PM: Product Manager
- TL: Tech Lead
- BE: Backend Engineer
- FE: Frontend Engineer
- AI: AI/ML Engineer
- QA: QA Engineer

## Backlog

| ID | Task | Epic | Priority | Owner | ETA | Dependencies | Definition of Done |
|---|---|---|---|---|---|---|---|
| E1-1 | Setup mono-workspace structure (`frontend`, `backend`, `ai-service`) | Epic 1 | P0 | TL | 2d | - | Folders, READMEs, run instructions available |
| E1-2 | Create core DB schema + migration baseline | Epic 1 | P0 | BE | 2d | E1-1 | SQL schema reviewed and applied locally |
| E1-3 | Configure CI pipeline (lint/test/build placeholders) | Epic 1 | P0 | TL | 1d | E1-1 | CI executes on push/PR without failure |
| E1-4 | Provision AI runtime strategy (local/container/cloud profile) | Epic 1 | P0 | AI | 2d | E1-1 | Runtime selection documented with resource estimate |
| E2-1 | Build multilingual patient intake form (TH/MM/Karen text) | Epic 2 | P1 | FE | 4d | E1-1 | Form submits valid payloads and handles validation |
| E2-2 | Backend intake API + request validation | Epic 2 | P1 | BE | 3d | E1-2 | Endpoint persists records and returns session ID |
| E2-3 | Translation adapter integration + fallback behavior | Epic 2 | P1 | BE,AI | 4d | E2-2 | Source + translated text + confidence stored |
| E3-1 | Prompt v1 for follow-up symptom interview | Epic 3 | P1 | AI | 3d | E2-3 | Prompt eval shows relevant follow-up questions |
| E3-2 | Session context manager for multi-turn chat | Epic 3 | P1 | BE | 3d | E2-2 | Context retained across turns with timeout policy |
| E3-3 | Clinical summary schema + generator pipeline | Epic 3 | P1 | AI,BE | 4d | E3-1,E3-2 | JSON summary validates against schema |
| E4-1 | Rule-based red-flag engine | Epic 4 | P0 | BE | 3d | E3-3 | Red-flag cases force Critical and log reasons |
| E4-2 | Feature engineering for triage model baseline | Epic 4 | P1 | AI | 4d | E3-3 | Feature set documented and reproducible |
| E4-3 | Train and evaluate baseline triage classifier | Epic 4 | P1 | AI | 5d | E4-2 | Baseline report with accuracy + confusion matrix |
| E4-4 | Hybrid decision combiner (ML + rules override) | Epic 4 | P0 | BE,AI | 3d | E4-1,E4-3 | Final triage endpoint outputs level + rationale |
| E5-1 | Dashboard queue and risk panel | Epic 5 | P1 | FE | 4d | E4-4 | Staff can view queue sorted by risk/time |
| E5-2 | Clinical summary + source translation panel | Epic 5 | P1 | FE | 3d | E5-1 | Side-by-side summary and original text rendered |
| E5-3 | Doctor override action + audit trail | Epic 5 | P0 | FE,BE | 3d | E5-1 | Override persists user/time/reason |
| E5-4 | Real-time queue updates | Epic 5 | P2 | BE,FE | 3d | E5-1 | Queue updates without manual refresh |
| E6-1 | PII anonymization pipeline | Epic 6 | P0 | BE | 3d | E2-2 | PII stripped before AI call |
| E6-2 | Security controls and PDPA checklist | Epic 6 | P0 | TL | 2d | E1-3 | Checklist completed and reviewed |
| E6-3 | Automated triage accuracy test harness | Epic 6 | P1 | QA,AI | 4d | E4-4 | Regression suite runs in CI |
| E6-4 | Performance and load testing | Epic 6 | P1 | QA,BE | 3d | E5-4 | Report confirms targets or action plan |

## Priority Legend
- P0: Critical path for Phase 1
- P1: Important for MVP completeness
- P2: Valuable enhancement after MVP stability
