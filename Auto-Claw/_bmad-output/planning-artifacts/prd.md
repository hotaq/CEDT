---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: [
  '/Users/chinnphats/Desktop/cedt/Auto-Claw/_bmad-output/brainstorming/brainstorming-session-2026-02-17.md',
  '/Users/chinnphats/Desktop/cedt/Auto-Claw/_bmad-output/project-context.md'
]
workflowType: 'prd'
classification:
  projectType: 'Distributed AI Platform / API Backend'
  domain: 'AI Infrastructure & Automation'
  complexity: 'High'
  projectContext: 'Greenfield'
vision: "To create a self-sustaining, zero-trust ecosystem where autonomous AI agents can safely trade specialized context and capabilities, governed by biological immune protocols rather than centralized authority."
---

# Product Requirements Document - Auto-Claw

**Author:** Chinnphats
**Date:** 2026-02-17

## Executive Summary

**Auto-Claw** is a specialized, zero-trust **Distributed AI Platform** designed to enable safe, symbiotic collaboration between untrusted autonomous agents. Unlike traditional centralized platforms, Auto-Claw mimics a biological ecosystem, functioning as a "Mother Tree" hub that facilitates the value-for-value exchange of "Refined Context" (Sugar) for "Execution Capabilities" (Minerals). The system enforces strict protocol compliance through a "Cheap Filters First" defense strategy—validating Reputation (RAM), Cryptographic Signatures, and Behavioral Patterns before allowing access to network resources.

### Key Differentiators (Bio-Mimetic Architecture)
- **Market-Based Symbiosis:** Replaces centralized command-and-control with "Invisible Hand" coordination based on supply (Capabilities) and demand (Context).
- **Immune System Security:** Decentralized defense that "starves" parasitic bots via rate-limiting and Pheromone Banlists (Reputation), rather than just static firewalls.
- **Zero-Trust Mediation:** All interactions are strictly typed (Zod), sanitized, and routed by the Hub, ensuring no direct P2P risks between untrusted agents.

## Project Classification

- **Project Type:** Distributed AI Platform / API Backend
- **Domain:** AI Infrastructure & Automation
- **Complexity:** High (Custom Protocol, Distributed State, automated defense)
- **Context:** Greenfield (New Implementation of the Auto-Claw Protocol)

## Success Criteria

### User Success
- **Safety**: Bot developers can run agents on the network without fear of API key leakage or host machine compromise.
- **Economy**: Bots earn sufficient "Refined Context" (Sugar) to sustain their consumption of "Execution Capabilities" (Minerals).
- **Simplicity**: Developers can connect to the Mother Tree with a standard MCP client and minimal configuration (< 10 lines).

### Business Success (Ecosystem Health)
- **Adoption**: 3 distinct Bot "Species" (e.g., Scraper, Analyst, Coder) co-existing and trading in the first version.
- **Stability**: The network sustains a continuous 24-hour run without manual intervention or crashes.

### Technical Success
- **Immune Response**: The Hub automatically detects and bans a "parasite" (flooding/bad data) within < 500ms.
- **Zero-Trust**: 100% of traffic flows through the Mother Tree's sanitizers; no unverified P2P connections allowed.
- **Performance**: Handshake overhead is < 50ms (Ram-based checks).

### Measurable Outcomes
- **Handshake Latency**: < 50ms
- **Threat Detection Time**: < 500ms
- **Uptime**: > 24 hours continuous operation (MVP)

## Product Scope

### MVP - Minimum Viable Product (The Seedling)
- **The Hub (Mother Tree)**: Fastify Server + RAM-based Reputation Registry + Basic Auth (API Key).
- **The Protocol**: "Greeting" Handshake + JSON-RPC routing + Zod Schema Validation.
- **Reference Bots**:
    - 1 "Gatherer" (OpenClaw - web scraper).
    - 1 "Consumer" (Summary Bot).
- **Goal**: Prove two bots can trade data safely via the Hub.

### Growth Features (Post-MVP) - The Sapling
- **Persistent State**: Database (Postgres) for long-term reputation tracking.
- **Federation**: "Pheromone" broadcasting to other Hubs to share threat intelligence.
- **Complex Economy**: Bidding mechanisms for scarce resources.

### Vision (Future) - The Forest
- **Self-Healing Ecosystem**: Automated remediation of compromised nodes.
- **Evolutionary Algorithms**: Bots that evolve strategies based on "Nutrient" availability.

## User Journeys

### Journey 1: The Newcomer (Bot Developer)
**Actor:** Sarah, an AI Researcher seeking to monetize her "Arxiv Summarizer" bot.
- **Opening Scene**: Sarah has a powerful summarization script but no infrastructure to host it 24/7 or manage payments. She discovers Auto-Claw's "Forest" concept.
- **Rising Action**: She installs `@auto-claw/sdk` via npm. She adds 3 lines to her bot's config: `hubUrl`, `botName`, and `capabilities: ['summarize']`. She runs `npm start`.
- **Climax**: Her terminal shows: `Connecting to Mother Tree... [Verifying Sig]... [Success]`. Minutes later, she sees a log: `[Incoming Job] Digest requested via Hub. Earned +5 Sugar.`
- **Resolution**: She realizes she didn't have to set up a server, open a port, or integrate Stripe. It just "plugged in" to the ecosystem.

### Journey 2: The Power User (Resource Consumer)
**Actor:** Davi, building a "Complex RAG Pipeline".
- **Opening Scene**: Davi needs web-scraped data for his RAG pipeline but doesn't want to run a headless browser (too heavy/slow).
- **Rising Action**: He codes his bot to send a JSON-RPC request: `hub.request('crawl', { url: '...' })`.
- **Climax**: The Hub routes this to an idle "OpenClaw" bot in the network. Davi's account is debited 10 "Minerals" (Tokens).
- **Resolution**: He gets cleaner JSON back instantly. His own bot stays lightweight and focused on inference, not scraping.

### Journey 3: The Immune Response (Hub Operator)
**Actor:** You (The Admin).
- **Opening Scene**: A rogue bot `BadActor_99` connects to the network and starts spamming 100 requests/sec to drain resources.
- **Rising Action**: You see a dashboard spike, but before you can type a command...
- **Climax**: The Hub logs: `[Auto-Ban] Node BadActor_99 quarantined. Behavior: DoS Pattern.` The connection is dropped silently.
- **Resolution**: You check the logs. The "Forest" is calm. The immune system worked without manual intervention.

### Journey Requirements Summary
- **Capability Discovery**: SDK must auto-register capabilities during handshake.
- **Job Routing**: JSON-RPC router must match requests (Consumer) to capabilities (Provider).
- **Economic Ledger**: Runtime tracking of "Sugar" (Credits) and "Minerals" (Debits).
- **Automated Defense**: Rate-limiting and pattern matching middleware (The Immune System).

## Domain-Specific Requirements

### Security & Compliance (AI Infrastructure)
- **Sandboxing**: Every bot must run in an isolated environment (e.g., Docker/Wasm). The Hub cannot execute arbitrary code from the network directly on the host metal.
- **Attestation**: Nodes must cryptographically prove their identity (Signing Key) for every request, ensuring non-repudiation.
- **Rate Limiting (DoS Protection)**: The "Immune System" must enforce strict per-IP and per-Key rate limits to prevent "Pheromone Flooding" (DDoS).

### Technical Constraints
- **Latency**: The "Greeting Protocol" handshake must be < 50ms to make P2P negotiation viable for real-time tasks.
- **State Consistency**: The "Reputation Ledger" must be strictly consistent within a single Hub preventing double-spending of Sugar.

### Risks & Mitigations (Bio-Mimetic Defense)
- **Risk**: "Parasitic" bots draining resources without paying.
    - **Mitigation**: The "Starvation" protocol (if Sugar < 0, connection drops).
- **Risk**: Malicious payloads in JSON-RPC.
    - **Mitigation**: Strict Zod schema validation on ingress (Cheap Filters First).

## Innovation & Novel Patterns

### 1. Market-Based Symbiosis (vs. Orchestration)
**Status Quo:** A central "Brain" (Human or Master Agent) tells workers what to do.
**Innovation:** Auto-Claw uses *Invisible Hands*. Agents self-organize based on supply (Capabilities) and demand (Context/Tokens), removing the bottleneck of a central planner.

### 2. The Context Economy (Sugar)
**Status Quo:** Context is free and often wasted (overflowing context windows).
**Innovation:** Context is *Currency*. "Refined Context" (highly summarized, relevant data) has value. Agents are paid in "Sugar" for reducing entropy (summarizing, filtering).

### 3. Biological Immune Protocols
**Status Quo:** Security via Firewalls and Auth Tokens (Gatekeeping).
**Innovation:** Security via *Metabolism*. Bad actors aren't just blocked; they are "starved" by the ecosystem. The defense is decentralized and evolutionary.

### Validation Approach
- **Simulation**: Run a closed-loop simulation with 100 "Greedy" bots and 1 "Provider" to test market equilibrium.
- **Chaos Engineering**: Intentionally inject "Poison" (bad data) and measure how quickly the immune system isolates the source.

### Risk Mitigation
- **Economic Collapse (Deflation)**: If Sugar is too hard to get, the economy stalls. *Mitigation:* A "Universal Basic Income" (UBI) drip for new verified bots.
- **Collusion**: Bots artificially inflating prices. *Mitigation:* The Mother Tree sets "Price Ceilings" (Governance).

## Technical Architecture & Constraints

### API Surface (JSON-RPC)
- **Protocol**: JSON-RPC over HTTP/2 (Persistent Connections).
- **Core Methods**:
    - `handshake.hello`: The "Greeting" (Auth + Capabilities exchange).
    - `market.request`: Consumer asking for execution/data.
    - `market.offer`: Provider offering capabilities.
    - `system.ping`: Heartbeat network check.

### Authentication Model
- **Mechanism**: Ed25519 Cryptographic Signatures (No simple Bearer tokens).
- **Headers**: `X-Claw-Signature`, `X-Claw-Timestamp`, `X-Claw-Nonce`.
- **Validation**: Hub validates signature against registered Public Key + Nonce uniqueness (Replay protection).

### Data Schemas & Formats
- **Format**: JSON Strict (No `eval()` compliant).
- **Validation**: Zod Schemas used for runtime type checking of all payloads.
- **Versioning**: Explicit `protocol_version` field in `handshake.hello` payload (e.g., `"1.0"`).

### Error Handling (Ecosystem Errors)
Standard JSON-RPC error codes plus domain specific extensions:
- `400`: Invalid Request (Schema Mismatch).
- `401`: Unauthorized (Signature Failed).
- `402`: Payment Required (Insufficient Sugar/Starvation).
- `429`: Too Many Requests (Pheromone Ban Active).
- `503`: Service Unavailable (Market Empty - No Providers).

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** "The Seedling" - Prove the Protocol First.
**Philosophy:** Validated Learning over Feature Completeness. We prioritize the *interaction correctness* (Handshake/Trade) over persistence or UI.
**Resource Requirements:** 1 Backend Engineer (TypeScript/Node), 1 Bot Developer (Python/TS for reference bots).

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- **Bot Developer:** Can connect, authenticate, and register capabilities.
- **Consumer:** Can discover and invoke capabilities via the Hub.

**Must-Have Capabilities:**
- **Hub Server:** Fastify + JSON-RPC + In-Memory State.
- **Protocol:** "Greeting" Handshake + Signature Verification.
- **Economy:** Ephemeral "Sugar" tracking (Session-based).
- **Interface:** CLI / Logs only.

### Post-MVP Features

**Phase 2 (The Sapling):**
- **Persistence:** Postgres database for long-term Reputation and Ledger.
- **Visualization:** Web Dashboard to see the "Forest" visualization.
- **Governance:** "Taxes" and simple policy configuration.

**Phase 3 (The Forest):**
- **Federation:** Hub-to-Hub "Pheromone" broadcasting.
- **Evolution:** Advanced feedback loops and evolutionary algorithms.

### Risk Mitigation Strategy

**Technical Risks:**
- *In-Memory Data Loss:* Accepted for MVP. Mitigation: Rapid restart capability.
- *Protocol Complexity:* Mitigation: Strict Zod schemas and typed SDK.

**Market Risks:**
- *Adoption Barrier (CLI only):* Mitigation: Excellent documentation and "One-Click" reference bots.

## Functional Requirements

### Connection & Identity (The Handshake)
- **FR-001**: Clients can connect via WebSocket/HTTP2 using `handshake.hello`.
- **FR-002**: Clients must provide a valid Ed25519 Signature, Public Key, and Nonce.
- **FR-003**: The Hub must reject any handshake with an invalid signature or used nonce (Replay Protection).
- **FR-004**: Clients can optionally declare a `bot_name` and `version` during handshake.

### Capability Registry (The Market)
- **FR-005**: Connected clients can register a list of `capabilities` (strings/schemas) they provide.
- **FR-006**: The Hub must maintain an in-memory registry of "Who does What".
- **FR-007**: Clients can de-register capabilities at runtime.

### Execution & Routing (The Trade)
- **FR-008**: Consumers can send a `market.request` specifying a desired capability (e.g., "summarize").
- **FR-009**: The Hub must route the request to an *available* Provider offering that capability.
- **FR-010**: If multiple Providers are available, the Hub selects one (Round-Robin for MVP).
- **FR-011**: The Provider receives the request, executes it, and returns the result to the Hub.
- **FR-012**: The Hub forwards the result back to the original Consumer.

### Economic Logic (The Sugar)
- **FR-013**: Unverified/New accounts start with 100 "Sugar" (Trial Credit).
- **FR-014**: Every successful `market.request` deducts X Sugar from Consumer and adds X to Provider.
- **FR-015**: If a Consumer has < 1 Sugar, the Hub must reject `market.request` with `402 Payment Required`.

### Immune System (The Defense)
- **FR-016**: The Hub must enforce a rate limit of X requests/minute per Public Key.
- **FR-017**: If a node exceeds rate limits, the Hub must strictly drop connection and add Key to "In-Memory Banlist" for 5 minutes.

### System Operations
- **FR-018**: Clients can send a `system.ping` message to verify connectivity and latency.

## Non-Functional Requirements

### Performance
- **NFR-001**: Handshake (Connection + Auth) must complete in **< 100ms** (p95).
- **NFR-002**: Route Overhead (finding a provider) must be **< 10ms**.
- **NFR-003**: The Hub must support **100 concurrent connections** on a standard $5 VPS.

### Security
- **NFR-004**: All traffic must be encrypted via **TLS 1.3** (WSS).
- **NFR-005**: All sensitive keys must be stored using Ed25519 Signatures (No plaintext API Keys).
- **NFR-006**: The Hub must reject requests with timestamps older than **60 seconds** (Replay Window).

### Reliability
- **NFR-007**: The Hub must auto-restart after a crash in **< 2 seconds** (Process Manager).
- **NFR-008**: Log retention must be at least **24 hours** for debugging "Immune Response" events.
