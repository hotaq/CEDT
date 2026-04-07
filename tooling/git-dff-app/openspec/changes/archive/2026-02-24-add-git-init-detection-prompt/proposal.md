## Why

Opening a local folder that is not yet a Git repository currently fails with a validation error, which blocks first-time setup workflows. We need a guided path that detects non-initialized folders and lets users initialize Git directly from the app.

## What Changes

- Add automatic repository detection that distinguishes "not a Git repository" from other open failures.
- Add a user confirmation flow to run `git init` when the selected folder is not initialized.
- Add structured response metadata so frontend can render a clear "Initialize repository?" decision state.
- Preserve existing behavior for valid repositories and for users who decline initialization.

## Capabilities

### New Capabilities
- `git-init-bootstrap`: Covers detection, confirmation prompt state, and repository initialization outcome handling when opening non-Git folders.

### Modified Capabilities
- `repository-session`: Extend session-open requirements to support non-repository detection outcomes and optional initialization before session creation.

## Impact

- Backend command contract changes for `open_repo` and a new initialization command path.
- Frontend open-repository UX updates for explicit init confirmation and post-init retry.
- Additional safety and error handling tests for init-accepted, init-declined, and init-failure cases.
