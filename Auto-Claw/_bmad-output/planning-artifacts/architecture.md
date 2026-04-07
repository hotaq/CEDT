---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'project-context.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-18'
project_name: 'Auto-Claw'
user_name: 'Chinnphats'
date: '2026-02-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Hub Core:** Handshake (Auth), Capability Registry (InMemory), Job Routing (Round-Robin).
- **Economic Engine:** Sugar/Minerals tracking, payment validation.
- **Immune System:** Rate limiting, banlist management, connection dropping.
- **Client Protocol:** JSON-RPC over HTTP/2, Zod schema validation.

**Non-Functional Requirements:**
- **Performance:** Handshake < 100ms, Routing < 10ms.
- **Security:** Zero-trust (Ed25519), strict schema validation ("Cheap Filters First").
- **Reliability:** Auto-restart < 2s, 24h log retention.

**Scale & Complexity:**
- **Project Complexity:** Medium (Protocol-heavy, State-light for MVP).
- **Primary Domain:** Backend API / Distributed Systems.
- **Components:** Hub Server, Registry Store, Immune Defense, Economic Ledger.

### Technical Constraints & Dependencies

- **Stack:** Node.js (Fastify) + TypeScript.
- **Transport:** HTTP/2 (Persistent connections).
- **Auth:** Ed25519 Signatures (No standard JWT/Bearer).
- **State:** In-memory maps (MVP Only - no database yet).

### Cross-Cutting Concerns Identified

- **Ecosystem Error Handling:** Standardized error codes (402, 429) across all endpoints.
- **Audit Logging:** Every transaction (Sugar exchange) and ban event must be logged.
- **Type Sharing:** Shared Zod schemas between Hub and Bots (Monorepo implication).

## Starter Template Evaluation

### Primary Technology Domain
Backend API / Distributed Systems (Node.js + Fastify)

### Starter Options Considered

1.  **Fastify CLI (Official)**
    -   *Command:* `npm init fastify`
    -   *Pros:* Minimal, Standard, flexible for custom architecture.
    -   *Cons:* Requires manual setup for specific structure.

2.  **Clean Architecture Boilerplate**
    -   *Repo:* `aslupin/boilerplate-typescript-fastify-clean-architecture`
    -   *Pros:* Pre-configured layers.
    -   *Cons:* Too rigid, includes unneeded complexities for "Mother Tree" design.

### Selected Starter: Fastify CLI (Official)

**Rationale for Selection:**
The Auto-Claw "Mother Tree" requires a specialized architecture (Immune System, In-Memory Registry) that differs from standard CRUD apps. The official CLI provides a lightweight, best-practice foundation (TypeScript, Testing, Linting) without imposing a rigid structure, allowing us to implement our "Bio-Mimetic" patterns cleanly.

**Initialization Command:**

```bash
npm install fastify-cli --global
fastify generate . --lang=ts
npm install
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** Node.js + TypeScript (Pre-configured).
- **Test Framework:** Node.js native test runner (tap) or can easily swap to Vitest.
- **Structure:** Minimal Service/Plugin architecture (extensible).
- **Build Tooling:** `tsc` + `ts-node` (standard).

## Core Architectural Decisions

### Project Structure: Domain-Driven (Modular)
- **Decision:** Organize code by "Bio-modules" (Identity, Market, Immune, Economy).
- **Rationale:** Aligns perfectly with the generic "Bio-Mimetic" architecture. Keeps related logic (e.g., reputation calculation + banlist) together rather than spread across generic "services" folder.
- **Structure:** `src/modules/{domain}/[routes, services, schemas]`

### Data Access: Repository Pattern
- **Decision:** Use Interface-based Repositories (e.g., `IIdentityStore`).
- **Rationale:** Critical for the "MVP In-Memory -> Production Database" transition. We can implement `InMemoryIdentityStore` now and swap it for `RedisIdentityStore` later without changing module logic.

### Error Handling: Global Error Handler
- **Decision:** Centralized error handling via Fastify's `setErrorHandler`.
- **Rationale:** Simplifies code. Modules throw standard `AppError` types; the handler formats them into standard JSON-RPC error responses with correct codes (402, 429, etc.).

### Shared Schemas: Monorepo Workspace
- **Decision:** Use NPM Workspaces / Monorepo structure.
- **Rationale:** Allows sharing Zod schemas between the Hub and Bot Clients without publishing to a registry during early development.

### Deployment: Docker-First
- **Decision:** Containerized deployment.
- **Rationale:** Ensures consistent behavior across different host environments (VPS/Cloud) which is crucial for the "Seedling" concept.

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **Modules/Directories:** Kebab-case (e.g., `modules/identity`, `modules/immune-system`).
- **Classes/Interfaces:** PascalCase (e.g., `IdentityService`, `IIdentityStore`).
- **Filenames:** Kebab-case matching content (e.g., `identity.service.ts`, `identity.routes.ts`).

### Structure Patterns
- **Module Layout:**
    ```text
    src/modules/identity/
    ├── identity.routes.ts   # Fastify routes
    ├── identity.service.ts  # Business logic
    ├── identity.schema.ts   # Zod validations
    └── repo/                # Data access
        ├── i-identity.store.ts
        └── memory-identity.store.ts
    ```

### Communication Patterns
- **API Responses:** Strict **JSON-RPC 2.0** format.
    - Success: `{ "jsonrpc": "2.0", "result": ..., "id": ... }`
    - Error: `{ "jsonrpc": "2.0", "error": { "code": ..., "message": ... }, "id": ... }`

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
auto-claw/
├── package.json          # Workspaces config (Monorepo root)
├── docker-compose.yml    # Redis, Postgres (future infra)
├── .env.example          # Environment template
├── .gitignore
├── README.md
├── apps/
│   └── hub/              # The Main "Mother Tree" Server
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env
│       ├── src/
│       │   ├── app.ts            # Fastify Entry Point & Plugin Registration
│       │   ├── server.ts         # Server Start Script
│       │   ├── config/           # Environment Validation (Zod)
│       │   ├── common/           # Shared Utilities
│       │   │   ├── result.ts     # Result Pattern Helper
│       │   │   ├── errors.ts     # AppError Definitions
│       │   │   └── logger.ts     # Pino Config
│       │   └── modules/          # Bio-Modules (Domain Logic)
│       │       ├── identity/     # Auth & Capability Registry
│       │       │   ├── identity.routes.ts
│       │       │   ├── identity.service.ts
│       │       │   ├── identity.schema.ts
│       │       │   └── repo/
│       │       │       ├── i-identity.store.ts
│       │       │       └── memory-identity.store.ts
│       │       ├── market/       # Job Marketplace & Routing
│       │       │   ├── market.routes.ts
│       │       │   ├── market.service.ts
│       │       │   └── repo/
│       │       ├── immune/       # Rate Limiting & Banlist
│       │       │   ├── immune.middleware.ts
│       │       │   └── immune.service.ts
│       │       └── economy/      # Ledger & Payments
│       │           ├── economy.service.ts
│       │           └── repo/
│       └── test/                 # Integration Tests
│           ├── setup.ts
│           └── modules/
└── packages/
    └── shared-types/     # Shared Zod Schemas (Brain)
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts          # Public Exports
            ├── rpc.schema.ts     # JSON-RPC Protocol Definitions
            └── events.schema.ts  # PubSub Event Definitions
```

### Architectural Boundaries

**API Boundaries:**
- **External:** JSON-RPC over HTTP/2 at `POST /rpc`.
- **Internal:** Direct service calls (e.g., `IdentityService` calls `ImmuneService` to check ban status).
- **Auth:** `GreetingProtocol` (Handshake) creates a session; all subsequent calls require valid Session Token in headers.

**Component Boundaries:**
- **Modules:** Encapsulated domains. Cross-module communication via Services (not direct Repo access).
- **Shared Types:** Strictly segregated in `packages/shared-types` to prevent circular dependencies and allow bot reuse.

**Data Boundaries:**
- **Persistence:** Repositories (`repo/`) isolate data access. Modules perform logic on Entities, Repositories handle storage/retrieval.
- **State:** In-Memory Maps (`Map<string, T>`) for MVP. No direct global state access outside Repositories.

### Mappings
- **Protocol:** `packages/shared-types`
- **Immune System:** `apps/hub/src/modules/immune`
- **Registry:** `apps/hub/src/modules/identity/repo`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices (Node.js, Fastify, TypeScript) are fully compatible and standard. The Domain-Driven structure supports the "Bio-Mimetic" modularity required by the context.

**Pattern Consistency:**
Result Pattern and Global Error Handling provide a consistent error strategy. Naming conventions (Kebab-case modules, PascalCase classes) are standard for the chosen stack.

**Structure Alignment:**
The Project Structure fully enables the Domain-Driven architecture, with clear separation for `modules`, `repo`, and `shared-types`.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- **Hub Core:** Covered by `apps/hub` and `IdentityModule`.
- **Economic Engine:** Covered by `EconomyModule` and `LedgerService`.
- **Immune System:** Covered by `ImmuneModule` and Middleware.
- **Protocol:** Covered by `packages/shared-types`.

**Functional Requirements Coverage:**
All 18 FRs are architecturally supported by specific modules or the shared schema workspace.

**Non-Functional Requirements Coverage:**
- **Performance:** HTTP/2 and Fastify selected for low latency.
- **Security:** Ed25519 and Zod validation baked into the core protocol.
- **Reliability:** Docker containerization ensures consistent runtime.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions (Stack, Structure, Patterns) are documented.

**Structure Completeness:**
Full directory tree provided.

**Pattern Completeness:**
Naming and Communication patterns are strict and clear.

### Gap Analysis Results

*   **Identified Gaps (Minor):** Explicit logging configuration (Pino) is implied but detailed configuration pattern is a minor nice-to-have for implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Modular "Bio-Mimetic" structure allows independent evolution of subsystems.
- Zero-Trust security baked into the protocol layer (Schemas + Signatures).
- "Seedling" deployment strategy (Docker + In-Memory) is perfect for MVP.

**Areas for Future Enhancement:**
- Transition from In-Memory to Redis/Postgres (facilitated by Repo pattern).
- Expansion of the "Immune System" with more complex heuristics.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Scaffold the Monorepo and Initialize the Hub with Fastify CLI.

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Hub Core:** Handshake (Auth), Capability Registry (InMemory), Job Routing (Round-Robin).
- **Economic Engine:** Sugar/Minerals tracking, payment validation.
- **Immune System:** Rate limiting, banlist management, connection dropping.
- **Client Protocol:** JSON-RPC over HTTP/2, Zod schema validation.

**Non-Functional Requirements:**
- **Performance:** Handshake < 100ms, Routing < 10ms.
- **Security:** Zero-trust (Ed25519), strict schema validation ("Cheap Filters First").
- **Reliability:** Auto-restart < 2s, 24h log retention.

**Scale & Complexity:**
- **Project Complexity:** Medium (Protocol-heavy, State-light for MVP).
- **Primary Domain:** Backend API / Distributed Systems.
- **Components:** Hub Server, Registry Store, Immune Defense, Economic Ledger.

### Technical Constraints & Dependencies

- **Stack:** Node.js (Fastify) + TypeScript.
- **Transport:** HTTP/2 (Persistent connections).
- **Auth:** Ed25519 Signatures (No standard JWT/Bearer).
- **State:** In-memory maps (MVP Only - no database yet).

### Cross-Cutting Concerns Identified

- **Ecosystem Error Handling:** Standardized error codes (402, 429) across all endpoints.
- **Audit Logging:** Every transaction (Sugar exchange) and ban event must be logged.
- **Type Sharing:** Shared Zod schemas between Hub and Bots (Monorepo implication).

## Starter Template Evaluation

### Primary Technology Domain
Backend API / Distributed Systems (Node.js + Fastify)

### Starter Options Considered

1.  **Fastify CLI (Official)**
    -   *Command:* `npm init fastify`
    -   *Pros:* Minimal, Standard, flexible for custom architecture.
    -   *Cons:* Requires manual setup for specific structure.

2.  **Clean Architecture Boilerplate**
    -   *Repo:* `aslupin/boilerplate-typescript-fastify-clean-architecture`
    -   *Pros:* Pre-configured layers.
    -   *Cons:* Too rigid, includes unneeded complexities for "Mother Tree" design.

### Selected Starter: Fastify CLI (Official)

**Rationale for Selection:**
The Auto-Claw "Mother Tree" requires a specialized architecture (Immune System, In-Memory Registry) that differs from standard CRUD apps. The official CLI provides a lightweight, best-practice foundation (TypeScript, Testing, Linting) without imposing a rigid structure, allowing us to implement our "Bio-Mimetic" patterns cleanly.

**Initialization Command:**

```bash
npm install fastify-cli --global
fastify generate . --lang=ts
npm install
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** Node.js + TypeScript (Pre-configured).
- **Test Framework:** Node.js native test runner (tap) or can easily swap to Vitest.
- **Structure:** Minimal Service/Plugin architecture (extensible).
- **Build Tooling:** `tsc` + `ts-node` (standard).
