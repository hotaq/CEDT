# Continue OpenSpec Change: build-tauri-lazygit-like-app (Next Artifact)

## TL;DR
> **Summary**: Create the next ready OpenSpec artifact for `build-tauri-lazygit-like-app` (expected: `design.md`) and stop after exactly one artifact.
> **Deliverables**: `openspec/changes/build-tauri-lazygit-like-app/design.md` (or first ready artifact per `openspec status --json`)
> **Effort**: Quick
> **Parallel**: NO
> **Critical Path**: Determine next ready artifact -> write artifact -> verify status

## Context
### Original Request
- Continue working on the OpenSpec change by creating the next artifact (one per invocation).

### Current Repo State (verified)
- Change: `build-tauri-lazygit-like-app`
- Schema: `spec-driven` (`openspec/changes/build-tauri-lazygit-like-app/.openspec.yaml`)
- Completed: `proposal` (`openspec/changes/build-tauri-lazygit-like-app/proposal.md`)
- Ready: `design`, `specs` (per `openspec status --change "build-tauri-lazygit-like-app" --json`)
- Blocked: `tasks` (blocked by `design` + `specs`)

### Metis Review (gaps addressed)
- Add concrete Git CLI parsing guardrails (porcelain v2 + `-z`, `git -C`, `--` before pathspec) to design.
- Call out concurrency/lock contention mitigations (`--no-optional-locks` for background refresh, serialized mutation queue).
- Keep v1 scope local-only; no remote/auth UI unless explicitly requested.

## Work Objectives
### Core Objective
- Create exactly ONE OpenSpec artifact for the selected change, following `openspec instructions <artifact-id> --json`.

### Definition of Done (agent-verifiable)
- `openspec status --change "build-tauri-lazygit-like-app" --json` shows the chosen artifact moved from `ready` -> `done`.
- The artifact file(s) exist at the `outputPath` returned by `openspec instructions ... --json`.
- Artifact content follows the `template` section headings and does NOT include any `<context>` / `<rules>` blocks from instructions.

### Must Have
- Deterministic next-artifact selection: pick the FIRST artifact in the returned JSON array whose `status` is exactly `"ready"`.
- Read all dependency artifacts listed in the instructions JSON before writing.
- Create ONE artifact only; stop immediately after updating status.

### Must NOT Have
- Do not create multiple artifacts in one run.
- Do not expose a generic "run command" API in the design (security boundary).
- Do not expand scope to remote operations (fetch/pull/push) or auth UI in v1.

## Verification Strategy
- Verification commands:
  - `openspec status --change "build-tauri-lazygit-like-app" --json`
  - `openspec status --change "build-tauri-lazygit-like-app"`
  - `ls <outputPath>` (verify artifact exists)

## TODOs

- [ ] 1. Select change + compute next ready artifact

  **What to do**:
  - Run `openspec list --json`.
  - Present available changes sorted by `lastModified` and have the user select.
  - Run `openspec status --change "<selected>" --json`.
  - Choose next artifact deterministically: first element where `status == "ready"`.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` — Reason: CLI orchestration + deterministic selection
  - Skills: `[]`

  **Acceptance Criteria**:
  - [ ] Selected change name recorded (expected: `build-tauri-lazygit-like-app`).
  - [ ] Next artifact id computed without judgment (first `ready`).

  **QA Scenarios**:
  ```
  Scenario: Determine next artifact
    Tool: Bash
    Steps:
      1) openspec list --json
      2) openspec status --change "build-tauri-lazygit-like-app" --json
    Expected:
      - proposal is done
      - design and specs are ready
      - next artifact selected is "design" (because it appears first in artifacts array)
  ```

- [ ] 2. Create the next artifact (expected: design.md)

  **What to do**:
  - Run `openspec instructions <artifactId> --change "build-tauri-lazygit-like-app" --json`.
  - Read dependency files from the `dependencies` array (expected: `proposal.md`).
  - Write artifact output to the `outputPath` returned by instructions.

  **If artifactId == "design"**:
  - Use the structure from the `template` headings exactly.
  - Populate content using the prewritten design draft at `.sisyphus/drafts/build-tauri-lazygit-like-app-design.md`.
  - Ensure the design includes:
    - Git execution guardrails: `git -C`, arg-array only, porcelain v2 + `-z`, `--` before pathspec
    - Concurrency model: per-repo serialized mutation queue; debounced reads; snapshot ids
    - Safety model for destructive actions and clear error surfaces
    - Cross-platform assumptions: require system git on PATH in v1; good error if missing

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: artifact authoring + structured doc
  - Skills: `[]`

  **References**:
  - Dependency: `openspec/changes/build-tauri-lazygit-like-app/proposal.md`
  - Draft content: `.sisyphus/drafts/build-tauri-lazygit-like-app-design.md`
  - Instructions source: `openspec instructions design --change "build-tauri-lazygit-like-app" --json`
  - Tauri security docs: https://v2.tauri.app/security/capabilities/ and https://v2.tauri.app/security/permissions/
  - Git status porcelain v2: https://git-scm.com/docs/git-status

  **Acceptance Criteria**:
  - [ ] `openspec/changes/build-tauri-lazygit-like-app/design.md` exists.
  - [ ] `openspec status --change "build-tauri-lazygit-like-app" --json` shows `design` as `done`.
  - [ ] Artifact does not contain copied `<context>` / `<rules>` blocks.

  **QA Scenarios**:
  ```
  Scenario: Create design artifact and verify
    Tool: Bash
    Steps:
      1) openspec instructions design --change "build-tauri-lazygit-like-app" --json
      2) ls openspec/changes/build-tauri-lazygit-like-app/design.md
      3) openspec status --change "build-tauri-lazygit-like-app"
    Expected:
      - Progress increments (design marked complete)
      - tasks remains blocked until specs is completed

  Scenario: Guardrail check - no context/rules copied
    Tool: Grep
    Steps:
      1) Search design.md for "<context>" and "<rules>"
    Expected:
      - No matches
  ```

## Final Verification Wave
- F1: `openspec status --change "build-tauri-lazygit-like-app"` matches expected progress

## Next Invocation
- After this plan completes, run `/opsx-continue` again to create the next artifact (expected: `specs`), which will generate one spec file per capability.
