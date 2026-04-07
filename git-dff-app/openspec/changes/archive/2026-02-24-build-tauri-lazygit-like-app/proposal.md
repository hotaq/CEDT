## Why

Git workflows in the terminal are powerful but hard for many developers to discover and use quickly. We need a Tauri desktop app with a LazyGit-like interaction model so users can inspect repository state and execute common Git actions faster with less command memorization.

## What Changes

- Add a Tauri-based desktop application shell that can open a local Git repository and keep repository state in sync.
- Add a keyboard-first status interface for file changes, staging, unstaging, and diff inspection.
- Add commit workflow support, including commit message entry and branch-aware commit execution.
- Add branch and history views so users can browse branches, inspect recent commits, and switch branches.
- Add safe-guarded Git operation execution with user-visible errors and confirmations for risky actions.

## Capabilities

### New Capabilities
- `repository-session`: Open, validate, and track an active repository workspace in the desktop app.
- `git-status-staging`: Present working tree status and support stage/unstage/revert actions from the UI.
- `commit-flow`: Provide commit creation flow with validation and result feedback.
- `branch-and-history`: Show branches and recent history with actions to checkout branches.
- `git-operation-safety`: Standardize confirmations, error surfaces, and non-destructive defaults for Git commands.

### Modified Capabilities
- None.

## Impact

- Introduces a new desktop app surface using Tauri (Rust backend + web UI frontend).
- Adds integration with local Git operations and repository filesystem access.
- Defines core UX behavior that later design/spec/task artifacts will refine.
- May add dependencies for Git command orchestration, state synchronization, and keyboard-driven UI components.
