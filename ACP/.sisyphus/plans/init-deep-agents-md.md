# Plan: Generate AGENTS.md Knowledge Base Files

## TL;DR

> **Quick Summary**: Generate hierarchical AGENTS.md documentation files for the ACP codebase to help AI agents understand the project structure, conventions, and code map.
>
> **Deliverables**:
> - `./AGENTS.md` (root knowledge base)
> - `./src/modules/agent/AGENTS.md` (agent module guide)
> - `./sdk/AGENTS.md` (SDK package guide)
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential file writes
> **Critical Path**: Root → Agent module → SDK

---

## Context

### Original Request
User ran `/init-deep` command to generate AGENTS.md files for the ACP codebase.

### Analysis Summary
**Project Stats:**
- 28 TypeScript files, ~3,426 lines
- Max depth: 3 levels
- No existing AGENTS.md files

**Key Findings:**
- TypeScript/Node.js backend with Express + Socket.io
- MongoDB persistence (no Redis)
- API key authentication (`acp_live_xxx`)
- Separate SDK package (`acp-sdk`)
- Module pattern: controller/service/routes/types per domain

**Scored Locations:**
| Directory | Score | Decision |
|-----------|-------|----------|
| `.` (root) | - | ALWAYS |
| `src/modules/agent/` | 18 | CREATE |
| `sdk/` | 11 | CREATE |

---

## Work Objectives

### Core Objective
Create 3 AGENTS.md files that document the codebase for AI agents.

### Concrete Deliverables
- `./AGENTS.md` - Root knowledge base (project overview, structure, code map)
- `./src/modules/agent/AGENTS.md` - Agent module guide (service methods, patterns)
- `./sdk/AGENTS.md` - SDK package guide (client usage, API)

### Definition of Done
- [ ] All 3 files created with proper content
- [ ] No duplicate content across files
- [ ] Each file 50-100 lines
- [ ] Telegraphic style (concise)

### Must Have
- Code map with key symbols and locations
- WHERE TO LOOK table for common tasks
- Conventions specific to this project
- Anti-patterns to avoid

### Must NOT Have (Guardrails)
- Generic advice that applies to all projects
- Verbose explanations
- Repeated content from parent files

---

## Verification Strategy

### Test Decision
- **Automated tests**: NO
- **Agent-Executed QA**: YES

### QA Scenarios

```
Scenario: Verify AGENTS.md files exist
  Tool: Bash
  Steps:
    1. ls -la AGENTS.md src/modules/agent/AGENTS.md sdk/AGENTS.md
  Expected Result: All 3 files exist
  Evidence: .sisyphus/evidence/task-1-files-exist.txt

Scenario: Verify line counts
  Tool: Bash
  Steps:
    1. wc -l AGENTS.md src/modules/agent/AGENTS.md sdk/AGENTS.md
  Expected Result: Each file between 40-120 lines
  Evidence: .sisyphus/evidence/task-1-line-counts.txt

Scenario: Verify no duplicate content
  Tool: Bash
  Steps:
    1. diff <(grep "^##" AGENTS.md) <(grep "^##" src/modules/agent/AGENTS.md)
  Expected Result: Minimal section overlap
  Evidence: .sisyphus/evidence/task-1-no-dupes.txt
```

---

## Execution Strategy

### Sequential Execution (file dependencies)

```
Task 1: Create root AGENTS.md [quick]
  ↓
Task 2: Create src/modules/agent/AGENTS.md [quick]
  ↓
Task 3: Create sdk/AGENTS.md [quick]
  ↓
Task 4: Verify files [quick]
```

---

## TODOs

- [ ] 1. Create root AGENTS.md

  **What to do**:
  - Create `./AGENTS.md` with project overview
  - Include: OVERVIEW, STRUCTURE, WHERE TO LOOK, CODE MAP, CONVENTIONS, ANTI-PATTERNS, COMMANDS, NOTES
  - Code map from LSP findings: startServer, AgentService, MessageService, SocketHandler, auth, ACPClient
  - Keep to 50-100 lines

  **Must NOT do**:
  - Generic advice like "use TypeScript best practices"
  - Repeating obvious information

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2, 3
  - **Blocked By**: None

  **References**:
  - `src/server.ts:61` - startServer entry point
  - `src/modules/agent/agent.service.ts:5` - AgentService class
  - `src/modules/message/message.service.ts:6` - MessageService class
  - `src/websocket/socket.handler.ts:9` - SocketHandler class
  - `src/middleware/auth.ts:17` - auth middleware
  - `sdk/src/client.ts` - ACPClient class

  **Acceptance Criteria**:
  - [ ] File exists at `./AGENTS.md`
  - [ ] Contains OVERVIEW, STRUCTURE, WHERE TO LOOK, CODE MAP, CONVENTIONS sections
  - [ ] 50-100 lines
  - [ ] Code map has at least 6 symbols

  **QA Scenarios**:
  ```
  Scenario: Root AGENTS.md exists and valid
    Tool: Bash
    Steps:
      1. test -f AGENTS.md && wc -l AGENTS.md
      2. grep -c "## " AGENTS.md
    Expected Result: File exists, 40-120 lines, 5+ sections
    Evidence: .sisyphus/evidence/task-1-root-agents.txt
  ```

  **Commit**: NO

---

- [ ] 2. Create agent module AGENTS.md

  **What to do**:
  - Create `./src/modules/agent/AGENTS.md`
  - Focus on: AgentService methods, registration flow, friend system, status management
  - Key methods: register, findByApiKeyHash, sendFriendRequest, acceptFriendRequest, updateStatus
  - Keep to 30-60 lines
  - Do NOT repeat root AGENTS.md content

  **Must NOT do**:
  - Repeat project-level conventions from root
  - Generic Express/MongoDB advice

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `src/modules/agent/agent.service.ts` - AgentService class (273 lines)
  - `src/modules/agent/agent.controller.ts` - HTTP handlers
  - `src/modules/agent/agent.routes.ts` - Route definitions
  - `src/db/models/agent.model.ts` - Agent schema

  **Acceptance Criteria**:
  - [ ] File exists at `./src/modules/agent/AGENTS.md`
  - [ ] Contains agent-specific content only
  - [ ] 30-60 lines
  - [ ] Lists key service methods

  **QA Scenarios**:
  ```
  Scenario: Agent module AGENTS.md specific
    Tool: Bash
    Steps:
      1. grep -c "AgentService" src/modules/agent/AGENTS.md
      2. grep -c "register\|friend\|status" src/modules/agent/AGENTS.md
    Expected Result: Mentions AgentService, key methods
    Evidence: .sisyphus/evidence/task-2-agent-module.txt
  ```

  **Commit**: NO

---

- [ ] 3. Create SDK AGENTS.md

  **What to do**:
  - Create `./sdk/AGENTS.md`
  - Focus on: ACPClient class, connect flow, send/receive messages, auto-reconnect
  - Include usage example
  - Keep to 40-70 lines

  **Must NOT do**:
  - Repeat API documentation from docs module
  - Generic SDK advice

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:
  - `sdk/src/client.ts` - ACPClient implementation
  - `sdk/src/types.ts` - SDK type definitions
  - `sdk/package.json` - Package info

  **Acceptance Criteria**:
  - [ ] File exists at `./sdk/AGENTS.md`
  - [ ] Contains ACPClient usage
  - [ ] 40-70 lines
  - [ ] Has code example

  **QA Scenarios**:
  ```
  Scenario: SDK AGENTS.md has usage
    Tool: Bash
    Steps:
      1. grep -c "ACPClient" sdk/AGENTS.md
      2. grep -c "connect\|sendREST\|on" sdk/AGENTS.md
    Expected Result: Mentions ACPClient, key methods
    Evidence: .sisyphus/evidence/task-3-sdk.txt
  ```

  **Commit**: NO

---

- [ ] 4. Final verification

  **What to do**:
  - Verify all 3 files exist
  - Check line counts are reasonable
  - Ensure no major content duplication

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None
  - **Blocked By**: Task 3

  **Acceptance Criteria**:
  - [ ] All 3 files exist
  - [ ] Each file 30-120 lines
  - [ ] No obvious duplication

  **QA Scenarios**:
  ```
  Scenario: All AGENTS.md files valid
    Tool: Bash
    Steps:
      1. ls AGENTS.md src/modules/agent/AGENTS.md sdk/AGENTS.md
      2. wc -l AGENTS.md src/modules/agent/AGENTS.md sdk/AGENTS.md
    Expected Result: All exist, reasonable sizes
    Evidence: .sisyphus/evidence/task-4-verify.txt
  ```

  **Commit**: YES
  - Message: `docs: Add AGENTS.md knowledge base files`
  - Files: `AGENTS.md`, `src/modules/agent/AGENTS.md`, `sdk/AGENTS.md`
  - Pre-commit: None

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify all 3 files created with correct content structure.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Check line counts, formatting, no duplicate content.

---

## Success Criteria

### Verification Commands
```bash
ls -la AGENTS.md src/modules/agent/AGENTS.md sdk/AGENTS.md
wc -l AGENTS.md src/modules/agent/AGENTS.md sdk/AGENTS.md
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All files committed
