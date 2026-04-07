---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
inputDocuments: ['prd.md', 'architecture.md']
---

# Auto-Claw - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Auto-Claw, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR-001: Clients can connect via WebSocket/HTTP2 using `handshake.hello`.
- FR-002: Clients must provide a valid Ed25519 Signature, Public Key, and Nonce.
- FR-003: The Hub must reject any handshake with an invalid signature or used nonce (Replay Protection).
- FR-004: Clients can optionally declare a `bot_name` and `version` during handshake.
- FR-005: Connected clients can register a list of `capabilities` (strings/schemas) they provide.
- FR-006: The Hub must maintain an in-memory registry of "Who does What".
- FR-007: Clients can de-register capabilities at runtime.
- FR-008: Consumers can send a `market.request` specifying a desired capability (e.g., "summarize").
- FR-009: The Hub must route the request to an *available* Provider offering that capability.
- FR-010: If multiple Providers are available, the Hub selects one (Round-Robin for MVP).
- FR-011: The Provider receives the request, executes it, and returns the result to the Hub.
- FR-012: The Hub forwards the result back to the original Consumer.
- FR-013: Unverified/New accounts start with 100 "Sugar" (Trial Credit).
- FR-014: Every successful `market.request` deducts X Sugar from Consumer and adds X to Provider.
- FR-015: If a Consumer has < 1 Sugar, the Hub must reject `market.request` with `402 Payment Required`.
- FR-016: The Hub must enforce a rate limit of X requests/minute per Public Key.
- FR-017: If a node exceeds rate limits, the Hub must strictly drop connection and add Key to "In-Memory Banlist" for 5 minutes.
- FR-018: Clients can send a `system.ping` message to verify connectivity and latency.

### NonFunctional Requirements

- NFR-001: Handshake (Connection + Auth) must complete in **< 100ms** (p95).
- NFR-002: Route Overhead (finding a provider) must be **< 10ms**.
- NFR-003: The Hub must support **100 concurrent connections** on a standard $5 VPS.
- NFR-004: All traffic must be encrypted via **TLS 1.3** (WSS).
- NFR-005: All sensitive keys must be stored using Ed25519 Signatures (No plaintext API Keys).
- NFR-006: The Hub must reject requests with timestamps older than **60 seconds** (Replay Window).
- NFR-007: The Hub must auto-restart after a crash in **< 2 seconds** (Process Manager).
- NFR-008: Log retention must be at least **24 hours** for debugging "Immune Response" events.

### Additional Requirements

- **Starter Template**: Use Fastify CLI (`npm init fastify` command).
- **Project Structure**: Domain-Driven Module structure (`modules/identity`, `modules/market`, etc.).
- **Monorepo**: Shared Zod schemas in `packages/shared-types`.
- **Data Access**: Interface-based Repository Pattern (`IIdentityStore`, `InMemoryIdentityStore`).
- **Error Handling**: Global Error Handler using `setErrorHandler` and standard JSON-RPC codes.
- **Protocol**: Strict JSON-RPC 2.0 over HTTP/2.
- **Deployment**: Docker-first approach (Dockerfile & docker-compose.yml).

### FR Coverage Map

- FR-001 (Connect): Epic 1 - The Gateway
- FR-002 (Auth): Epic 1 - The Gateway
- FR-003 (Replay): Epic 1 - The Gateway
- FR-004 (Info): Epic 1 - The Gateway
- FR-005 (Register): Epic 2 - The Cortex
- FR-006 (Registry): Epic 2 - The Cortex
- FR-007 (Deregister): Epic 2 - The Cortex
- FR-008 (Request): Epic 3 - The Synapse
- FR-009 (Route): Epic 3 - The Synapse
- FR-010 (Select): Epic 3 - The Synapse
- FR-011 (Execute): Epic 3 - The Synapse
- FR-012 (Return): Epic 3 - The Synapse
- FR-013 (Trial): Epic 4 - The Metabolism
- FR-014 (Transfer): Epic 4 - The Metabolism
- FR-015 (Solvency): Epic 4 - The Metabolism
- FR-016 (Rate Limit): Epic 5 - The Immune System
- FR-017 (Auto-Ban): Epic 5 - The Immune System
- FR-018 (Ping): Epic 1 - The Gateway

## Epic List

### Epic 1: The Gateway (Secure Connectivity)
Enable secure, authenticated, persistent connections for bots so they can join the network safely.
**FRs covered:** FR-001, FR-002, FR-003, FR-004, FR-018

### Story 1.1: Initialize Monorepo & Hub Skeleton

As a Developer,
I want a Monorepo workspace with the Hub and Shared Types,
So that I can build the "Mother Tree" with proper type-safe contracts.

**Acceptance Criteria:**

**Given** a clean directory,
**When** I run `npm install` and `npm test`,
**Then** the project should install dependencies and run tests for both `apps/hub` and `packages/shared-types`.
**And** `apps/hub` should be a Fastify server initialized with TypeScript.
**And** `packages/shared-types` should be importable by the Hub.

### Story 1.2: Implement JSON-RPC over HTTP/2

As a Bot Developer,
I want to send JSON-RPC 2.0 requests over HTTP/2,
So that I can communicate with the Hub using a standard, efficient protocol.

**Acceptance Criteria:**

**Given** the Hub is running,
**When** I send a valid JSON-RPC request to `POST /rpc`,
**Then** I should receive a valid JSON-RPC response with `jsonrpc: "2.0"` and matching `id`.
**When** I send an invalid payload,
**Then** I should receive a JSON-RPC Error (`-32700 Parse error` or `-32600 Invalid Request`).
**And** the server must support HTTP/2 with TLS (or h2c for local dev).

### Story 1.3: The Greeting Protocol (Handshake)

As a Bot,
I want to authenticate using my Ed25519 signature,
So that I can prove my identity without leaking a secret key.

**Acceptance Criteria:**

**Given** I have a valid Ed25519 Keypair,
**When** I send `handshake.hello` with `pubKey`, `signature`, and `nonce`,
**Then** the Hub should verify the signature against the payload.
**And** if valid, return a `session_id`.
**And** if the signature is invalid, return `401 Unauthorized`.
**And** if the nonce was already used, return `401 Unauthorized` (Replay Protection).
**And** the handshake must complete in < 100ms.

### Story 1.4: System Ping & Health

As a Bot Operator,
I want to ping the system,
So that I can verify my connection is alive and measure latency.

**Acceptance Criteria:**

**Given** I am a connected client,
**When** I send `system.ping`,
**Then** I should receive a `pong` response with the server timestamp.
**And** this endpoint should be accessible even if I am not authenticated (rate-limited).

### Epic 2: The Cortex (Capability Registry)
Enable dynamic registration and discovery of bot skills so the network knows what capabilities are available.
**FRs covered:** FR-005, FR-006, FR-007

### Epic 3: The Synapse (Market & Routing)
Enable the routing of requests from Consumer to Provider so that value can be exchanged.
**FRs covered:** FR-008, FR-009, FR-010, FR-011, FR-012

### Epic 4: The Metabolism (Economic Engine)
Enforce the "Sugar" economy (payments and solvency) so that the ecosystem remains sustainable.
**FRs covered:** FR-013, FR-014, FR-015

### Epic 5: The Immune System (Automated Defense)
Protect the network from spam and abuse automatically so it remains healthy without manual intervention.
**FRs covered:** FR-016, FR-017
