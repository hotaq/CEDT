## Why

Easy Git currently covers local status, staging, commit, and checkout but still forces users back to terminal for the highest-frequency workflows after a commit: syncing with remotes, managing stashes, and creating branches. Adding these workflows now removes the biggest adoption blockers and keeps daily Git tasks fully inside the app.

## What Changes

- Add remote sync workflows in UI and backend for fetch, pull, and push with clear operation feedback and guarded failure handling.
- Add a stash manager workflow to create stash entries and restore them with apply/pop actions.
- Add branch creation workflow in UI to create local branches directly without terminal commands.
- Extend safety/error handling to cover remote and stash operations with explicit user guidance.

## Capabilities

### New Capabilities
- `remote-sync`: Covers fetch/pull/push command workflows, status indicators, and operation result feedback.
- `stash-manager`: Covers stash save/list/apply/pop/drop workflows exposed in the UI.
- `branch-creator`: Covers validated local branch creation from the current repository session.

### Modified Capabilities
- `branch-and-history`: Extend branch requirements to include create-branch behavior and branch-list refresh after creation.
- `git-operation-safety`: Extend safety requirements for remote/stash operations, including policy-safe error classification and actionable guidance.

## Impact

- Backend command surface in `ez-git/src-tauri/src/lib.rs` and typed API bindings in `ez-git/src/api.ts`.
- Frontend workflow sections in `ez-git/src/App.vue` for sync controls, stash manager interactions, and branch creation.
- Test coverage updates for command success/failure and policy handling in backend plus UI workflow regression checks.
