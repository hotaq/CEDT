## Context

The current status panel already separates staged, unstaged, and untracked files and recently added preview limits. However, users still perform many repetitive single-file actions (stage/unstage/discard) and must manually scan large sets to find targets. This slows common workflows in medium-to-large repositories. The design must preserve existing safety policies (especially discard confirmation and path constraints) while making interaction significantly faster with minimal backend risk.

## Goals / Non-Goals

**Goals:**
- Add fast file discovery controls for status lists (search/filter and useful grouping).
- Add multi-selection and bulk actions for stage/unstage/discard where policy allows.
- Expand keyboard-first operation so users can navigate and act without mouse-heavy interaction.
- Keep large lists usable through efficient rendering and constrained scrolling behavior.
- Preserve existing backend safety constraints and error contract semantics.

**Non-Goals:**
- Replacing the existing backend command model with a generic command executor.
- Implementing full virtualized list infrastructure across the entire app in this change.
- Adding remote/GitHub operations outside local status/staging workflows.
- Changing discard policy rules beyond applying existing rules to bulk actions.

## Decisions

1. **Decision: Add a unified selection model per status section with shared bulk-action toolbar.**
   - **Why:** Current single-item actions force repeated clicks and context switching.
   - **Alternatives considered:**
     - Keep per-row actions only (rejected: still slow for large batches).
     - Global selection across all sections only (rejected: harder policy messaging for mixed action types).

2. **Decision: Introduce lightweight client-side filtering (text + status section scoping) before heavy list operations.**
   - **Why:** Most usability pain is findability; users need to narrow targets quickly before staging.
   - **Alternatives considered:**
     - Backend-driven search endpoint (rejected for now: unnecessary complexity and latency for current data sizes).
     - No filter, rely on scrolling (rejected: poor UX for 100+ entries).

3. **Decision: Keep backend APIs largely stable and reuse existing multi-path command support.**
   - **Why:** `stage_paths`/`unstage_paths`/`discard_paths` already support path arrays, reducing backend churn.
   - **Alternatives considered:**
     - New bulk-only backend endpoints (rejected: duplicate logic with little benefit).
     - Frontend loop over single-item commands (rejected: slower and noisier state refresh behavior).

4. **Decision: Add keyboard interaction layers incrementally (selection movement, toggle select, bulk action shortcuts).**
   - **Why:** Keyboard throughput is a core product promise; changes should remain discoverable and safe.
   - **Alternatives considered:**
     - Mouse-first bulk UI only (rejected: conflicts with keyboard-first positioning).
     - Vim-mode-only model (rejected: too steep for broader users).

5. **Decision: Keep bounded list rendering with section-level scroll containers and explicit expansion controls.**
   - **Why:** Existing limit controls already improve performance; design builds on this instead of replacing it.
   - **Alternatives considered:**
     - Full virtualization now (rejected for scope/time; can be follow-up if needed).
     - Render-all by default (rejected: poor responsiveness).

## Risks / Trade-offs

- **[Risk] Bulk discard misuse with accidental selection** -> **Mitigation:** require explicit confirmation and clear selected-count messaging before destructive actions.
- **[Risk] Keyboard shortcut conflicts with browser/system defaults** -> **Mitigation:** scope shortcuts to active panel context and document fallback click actions.
- **[Risk] UI state complexity (filters + selection + expansion) introduces bugs** -> **Mitigation:** centralize derived state/computed selectors and add behavior-focused tests.
- **[Trade-off] Partial virtualization approach may still degrade at extreme list sizes** -> **Mitigation:** retain expansion limits and monitor need for full virtualization in next change.

## Migration Plan

1. Implement frontend selection/filter state model and section-level bulk toolbars.
2. Wire bulk actions to existing backend multi-path commands with current safety behavior.
3. Add keyboard shortcuts and contextual help text for new operations.
4. Validate behavior on large synthetic status sets and real repositories.
5. Rollback strategy: disable bulk UI/shortcuts behind feature flag branch, retain previous per-row action flow.

## Open Questions

- Should bulk selection support cross-section action queues (for example, mixed staged + unstaged selection) or remain section-local only?
- Do we need persisted filter preferences across sessions, or is per-session state sufficient?
- Should list grouping default by directory path depth, file type, or recent change frequency?
