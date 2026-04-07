## 1. Remote Sync Backend Commands

- [ ] 1.1 Add allowlisted backend commands for `fetch_remote`, `pull_remote`, and `push_remote` in `ez-git/src-tauri/src/lib.rs`.
- [ ] 1.2 Implement command execution paths with structured success/failure payloads and existing error categories.
- [ ] 1.3 Refresh branch/history/session-related state after successful sync operations.

## 2. Stash Manager Backend Commands

- [ ] 2.1 Add stash command endpoints for save/list/apply/pop/drop with typed response models.
- [ ] 2.2 Enforce explicit confirmation flow for destructive stash actions (drop and destructive pop edge cases).
- [ ] 2.3 Return actionable guidance for stash failures without reporting partial success states.

## 3. Branch Creator Backend + API Wiring

- [ ] 3.1 Add local branch creation command with branch-name validation and policy-safe error responses.
- [ ] 3.2 Update typed API wrappers in `ez-git/src/api.ts` for remote sync, stash manager, and branch creation operations.
- [ ] 3.3 Ensure branch creation success triggers branch-list refresh and active-branch consistency.

## 4. Frontend UX Integration

- [ ] 4.1 Add Sync controls in `ez-git/src/App.vue` for fetch/pull/push with operation feedback messages.
- [ ] 4.2 Add Stash Manager panel for save/list/apply/pop/drop flows with clear target selection.
- [ ] 4.3 Add Branch Creator UI with validation feedback and seamless transition to refreshed branch state.
- [ ] 4.4 Keep new controls responsive and keyboard-friendly across desktop/tablet/mobile breakpoints.

## 5. Verification and Regression Coverage

- [ ] 5.1 Add backend tests for remote sync success/failure paths and error classification behavior.
- [ ] 5.2 Add backend tests for stash manager safety requirements (confirmation, failure handling, result consistency).
- [ ] 5.3 Add backend tests for branch creation validation and refresh outcomes.
- [ ] 5.4 Run frontend tests/build and Rust tests to confirm no regressions in existing status/staging/commit workflows.
