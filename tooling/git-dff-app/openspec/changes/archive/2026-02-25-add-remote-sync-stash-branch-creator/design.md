## Context

Easy Git currently provides local-only workflows (status/staging, commit, history, checkout) and explicitly excluded remote/stash operations in earlier scope decisions. Users now hit a product boundary immediately after local commits because push/pull/fetch, stash usage, and branch creation still require terminal commands. This change spans backend command capabilities, frontend interaction model, and safety/error policy expansion, so a design artifact is necessary to align behavior and avoid inconsistent UX across these high-impact workflows.

## Goals / Non-Goals

**Goals:**
- Add remote sync controls (fetch, pull, push) with clear success/failure feedback and non-blocking UI behavior.
- Add stash manager workflows (save, list, apply, pop, drop) with explicit, reversible user actions where possible.
- Add validated local branch creation from the app UI with immediate branch list/state refresh.
- Extend existing structured error model and safety policies to remote/stash operations.
- Preserve keyboard-first operation style and responsive layout quality for new controls.

**Non-Goals:**
- Full remote management (add/remove/set-url), authentication settings UI, or credential helper configuration.
- Advanced merge/rebase/conflict resolution UI for pull outcomes.
- Stash file-by-file partial apply UI in this change.
- Creating/renaming/deleting remote branches beyond local branch creation + normal push behavior.

## Decisions

1. **Decision: Keep backend command model allowlisted and explicit (no generic git passthrough).**
   - **Why:** Existing safety model depends on command-level policy control and structured error mapping.
   - **Alternatives considered:**
     - Generic command execution endpoint (rejected: weakens policy guardrails and error consistency).
     - Frontend shell calls (rejected: breaks trust boundary and cross-platform behavior guarantees).

2. **Decision: Introduce dedicated command endpoints for sync and stash workflows.**
   - **Why:** Explicit endpoints (`fetch_remote`, `pull_remote`, `push_remote`, `stash_save`, `stash_list`, `stash_apply`, `stash_pop`, `stash_drop`, `create_branch`) are easier to test and reason about than overloading existing commands.
   - **Alternatives considered:**
     - Single multiplexed command with operation enum (rejected: harder typing and less clear audit trail).
     - Piggybacking on existing commands (rejected: unclear ownership and response contract drift).

3. **Decision: Preserve current structured error payload categories for new operations.**
   - **Why:** Frontend already understands `validation`, `policy`, `git`, `internal`; extending these avoids fragmented UX.
   - **Alternatives considered:**
     - New remote/stash-specific categories (rejected: little value, increases branching logic).

4. **Decision: Keep branch creation local-first with immediate status/branch/history refresh.**
   - **Why:** Proposal scope is local branch creation; users should see instant UI consistency after creation.
   - **Alternatives considered:**
     - Auto-push upstream on creation (rejected: too implicit and potentially unsafe).
     - Branch creation with no refresh (rejected: stale UI and confusion).

5. **Decision: Add lightweight sync status indicators rather than background auto-sync.**
   - **Why:** Manual sync actions are predictable and avoid hidden network side effects in v1.
   - **Alternatives considered:**
     - Periodic auto-fetch/pull (rejected: unexpected network calls and conflict risk).
     - No indicators (rejected: poor user confidence in operation results).

## Risks / Trade-offs

- **[Risk] Remote commands may block on credential prompts and feel hung** -> **Mitigation:** return actionable git errors quickly, surface guidance, and keep operation status visible.
- **[Risk] Pull can fail due to conflicts and leave intermediate states** -> **Mitigation:** classify as policy/git error with explicit remediation text; avoid auto-resolve behavior.
- **[Risk] Stash drop/pop are destructive if mis-clicked** -> **Mitigation:** require explicit confirmation for destructive stash actions and show stash target labels clearly.
- **[Trade-off] Local-only branch creation limits remote branch UX** -> **Mitigation:** keep scope tight now; allow follow-up change for upstream tracking automation.

## Migration Plan

1. Add backend commands + DTOs for remote sync, stash, and branch creation using existing session/repo safety validation.
2. Extend frontend API layer (`api.ts`) with typed invoke wrappers and result/error types.
3. Add UI panels/controls in `App.vue` for Sync, Stash Manager, and Branch Creator with responsive layout integration.
4. Add tests for command success/failure and policy safeguards (especially stash destructive actions and branch validation).
5. Validate with build/tests and manual workflow smoke checks, then ship behind normal app flow (no migration required for existing repos).
6. Rollback strategy: hide new controls and disable new command handlers while retaining previous local-only workflows.

## Open Questions

- Should push/pull/fetch target always default to tracked upstream, or should UI include explicit remote/branch selectors in v1?
- Should stash list include commit-ish/context metadata beyond message/index for faster user selection?
- Do we need a per-operation timeout/abort UX for slow network remotes in this phase?
