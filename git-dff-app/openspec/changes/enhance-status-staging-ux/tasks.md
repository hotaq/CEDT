## 1. Status Panel Filtering and Grouping

- [x] 1.1 Add section-level filter state (query + mode) for staged, unstaged, and untracked lists in `ez-git/src/App.vue`.
- [x] 1.2 Implement grouped rendering mode(s) for status entries while preserving action controls and stable selection keys.
- [x] 1.3 Add UI controls to switch grouping/filter behavior with clear reset actions.

## 2. Multi-Select and Bulk Actions

- [x] 2.1 Implement section-local multi-selection model with count feedback and explicit clear selection actions.
- [x] 2.2 Add bulk stage and bulk unstage actions wired to existing multi-path backend commands.
- [x] 2.3 Add bulk discard flow that enforces existing confirmation and policy-safe reject behavior for unsupported selections.

## 3. Keyboard-First Productivity

- [x] 3.1 Add keyboard navigation for moving focus across list items within active section.
- [x] 3.2 Add keyboard shortcuts for selection toggle/select range and bulk action triggers.
- [x] 3.3 Update in-app shortcut help text and ensure context-scoped handling to avoid unsafe conflicts.

## 4. Responsiveness and Large-List Behavior

- [x] 4.1 Keep bounded rendering defaults with explicit expansion controls integrated with filtering/grouping state.
- [x] 4.2 Ensure section-level scrolling remains isolated and responsive under large status sets.
- [x] 4.3 Validate mobile and tablet behavior for new controls so touch interaction remains usable.

## 5. Verification and Regression Coverage

- [x] 5.1 Add frontend behavior tests for filtering, grouping, multi-select, and bulk action state transitions.
- [x] 5.2 Add integration checks for bulk action success/failure flows and policy rejection paths.
- [x] 5.3 Run build/test verification to confirm no regressions in existing open-repo, status refresh, and commit workflows.
