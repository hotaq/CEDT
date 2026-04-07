## Why

The current **Status + Staging** experience is still slow and hard to operate on large repositories because users must manage many file actions one-by-one and scan long lists manually. We need a more task-focused staging workflow now to reduce interaction time and improve control for high-change repos.

## What Changes

- Add fast filtering and grouping controls for staged, unstaged, and untracked lists.
- Add multi-select and bulk actions (stage, unstage, discard where allowed) for selected files.
- Add richer keyboard navigation and action shortcuts for list movement and batch operations.
- Add compact list density and per-section productivity controls to reduce scrolling/interaction overhead.
- Improve status list performance behavior for large result sets with smoother incremental rendering/interaction.

## Capabilities

### New Capabilities
- `status-staging-productivity`: Advanced interaction model for selection, bulk actions, filtering, and keyboard-first workflows in the status panel.

### Modified Capabilities
- `git-status-staging`: Extend requirements from basic segmented status display to include filterable, selectable, and bulk-operable list behavior with clear policy-safe constraints.

## Impact

- Frontend: `ez-git/src/App.vue` status panel state model, list rendering, controls, and keyboard handling.
- Backend: potential command payload shape updates for efficient multi-path operations and policy-safe discard constraints.
- Tests: add UX-level behavior checks for bulk staging workflows and performance/regression validations on large status sets.
