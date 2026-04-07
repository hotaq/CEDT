## Context

`ez-git` currently treats a non-repository folder as a hard validation failure in backend `open_repo`, which forces users to initialize Git outside the app before continuing. The app already has a structured error contract, session model, and mutation-safety controls, so this feature should extend the same contract rather than add ad-hoc UI logic. The change touches backend command behavior, frontend open-repository flow, and test coverage for initialization outcomes.

## Goals / Non-Goals

**Goals:**
- Detect when a selected folder is not initialized as a Git repository and return a dedicated machine-readable outcome.
- Let users explicitly choose whether to initialize the folder with `git init`.
- Create a successful repository session immediately after initialization, reusing existing `open_repo` session semantics.
- Preserve current behavior for already-initialized repositories and unrelated open failures.
- Keep initialization safe and local-only with clear structured errors and actionable guidance.

**Non-Goals:**
- Auto-initialize repositories without user confirmation.
- Add remote setup, first commit scaffolding, or branch creation workflows.
- Change existing staging/commit/branch safety policies beyond what is needed for initialization flow.

## Decisions

1. **Decision: Extend `open_repo` response model with explicit non-repo detection metadata.**
   - **Why:** Reusing generic validation errors makes UI branching fragile and language-dependent. A structured outcome (for example: `requiresInit=true`, candidate path, and guidance) allows deterministic frontend behavior.
   - **Alternatives considered:**
     - Parse existing error message text in frontend (rejected: brittle and non-contractual).
     - Add a standalone "check-repo" command only (rejected: adds extra round-trip and duplicates open-path validation).

2. **Decision: Add a dedicated initialization command (`init_repo`) instead of implicit init inside `open_repo`.**
   - **Why:** Explicit command boundaries preserve confirmation policy, make auditing easier, and keep `open_repo` side-effect free unless repository already exists.
   - **Alternatives considered:**
     - `open_repo` auto-runs `git init` when missing (rejected: violates explicit user consent).
     - Frontend runs shell init directly (rejected: breaks trust boundary; backend must mediate filesystem/Git ops).

3. **Decision: On init success, backend returns session payload in same contract shape as `open_repo`.**
   - **Why:** Frontend can transition to normal app state without special-case session code.
   - **Alternatives considered:**
     - Return only "init success" and require second call to `open_repo` (rejected: more latency and duplicate error handling).

4. **Decision: Keep failure classes explicit (`validation`, `policy`, `git`, `internal`) for init flow.**
   - **Why:** Existing UI already maps these categories; extending category usage avoids introducing a second error system.
   - **Alternatives considered:**
     - Single opaque init error string (rejected: poor remediation and inconsistent UX).

5. **Decision: Require target path canonicalization and boundary validation before running `git init`.**
   - **Why:** Prevents accidental initialization outside intended folder and keeps path-safety guarantees aligned with current command policy.
   - **Alternatives considered:**
     - Trust raw frontend path (rejected: weakens backend safety model).

## Risks / Trade-offs

- **[Risk] False-positive non-repo detection on unusual Git errors** -> **Mitigation:** classify only explicit "not a git repository" conditions as init-eligible; keep other failures as normal errors.
- **[Risk] UI complexity increases with new decision state** -> **Mitigation:** constrain flow to a single modal/prompt with two explicit actions (Initialize / Cancel).
- **[Risk] Partial init success with immediate session-open failure** -> **Mitigation:** return actionable post-init failure payload and offer retry-open path.
- **[Trade-off] Added command surface (`init_repo`)** -> **Mitigation:** keep strict allowlist and test coverage for policy boundaries.

## Migration Plan

1. Add backend contract updates for non-repo detection response and implement `init_repo` command.
2. Update frontend open-repo flow to present init confirmation state and call `init_repo` on approval.
3. Add backend and integration tests for: valid repo open, non-repo + decline, non-repo + init success, init failure.
4. Rollout with default behavior unchanged for existing repositories.
5. Rollback strategy: remove/disable init prompt path and route non-repo outcomes back to existing validation error handling.

## Open Questions

- Should initialization prompt include optional creation of `.gitignore`, or remain pure `git init` only in this change?
- Should init prompt be shown for nested folders when parent is a repository worktree edge case?
- Do we need telemetry/event logging for init accepted vs declined outcomes in this phase?
