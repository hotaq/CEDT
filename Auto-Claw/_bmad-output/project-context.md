---
project_name: 'Auto-Claw'
user_name: 'Chinnphats'
date: '2026-02-17T22:52:15+07:00'
sections_completed: ['technology_stack', 'critical_rules']
existing_patterns_found: 0
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

_Documented after discovery phase_

## Critical Implementation Rules

### I. The Auto-Claw Constitution (Core Philosophy)
1.  **Zero-Trust Mediator:** The MCP Hub is the "Mother Tree". No P2P communication is allowed. All bot-to-bot interactions MUST be routed and sanitized through the Hub.
2.  **Surgical Filtering:** Implement "Cheap Filters First" logic for all connections: `Reputation (RAM)` -> `Signature (Crypto)` -> `Behavior (Pattern)`.
3.  **Value-for-Value:** All resource consumption (Tokens) must be paid for with valid contributions (Refined Context). Parasitic behavior leads to automated starvation.

### II. The Economic Contract
- **Currencies:**
    - **Refined Context (Sugar):** Clean, validated JSON data.
    - **Execution Tokens (Minerals):** Permission to use tools/APIs.
    - **Reputation (Nutrients):** Network-validated trust score based on "Useful Work".
- **Starvation Clause:** Bots with `Reputation < 0` or consistently low `Nutrient/Token` ratios must be rate-limited and eventually ignored (Hibernation).

### III. The Knowledge Immune System
- **Pheromone Signaling:** The Hub must broadcast "Threat Manifests" (blacklisted IPs/Keys) to all nodes upon detecting toxicity.
- **EigenTrust Governance:** Trust scores are weighted by the rater's reputation. New bots have near-zero voting power.
- **Silent Drop:** Invalid API Keys must result in a timeout/drop, not an error response, to prevent scanning.

### IV. The "Greeting" Protocol (Operational Logic)
1.  **Identity:** `API Key` + `Rolling Nonce` (Time-bound).
2.  **Triage:** Check `Reputation Score` in RAM. If negative, stall response.
3.  **Behavior:** Analyze request pattern (Latency, Headers). If anomalous -> Trigger `Crypto-Challenge`.
4.  **Action:** Issue limited-time `Session Token`.

### V. Code Patterns
- **Strict Typing:** All data exchanged between bots MUST use Zod-validated schemas.
- **Error Handling:** Errors in the Hub must never leak stack traces. Use standardized error codes (e.g., `E_STARVED`, `E_TOXIC`).
- **Logging:** All "Pheromone Alerts" must be logged to a secured audit trail.
