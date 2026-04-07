## 1. Project and Runtime Setup

- [x] 1.1 Initialize the Tauri desktop project scaffold (Rust backend + web UI) and confirm local app launch on macOS, Windows, and Linux developer environments.
- [x] 1.2 Implement startup checks for system `git` availability and return actionable install guidance when `git` is not on PATH.
- [x] 1.3 Define shared request/response and error payload types for backend command contracts (including session, snapshot, and policy error metadata).

## 2. Repository Session and Boundary Enforcement

- [x] 2.1 Implement `open_repo` flow that resolves repository root from user-selected path and creates an active session identifier.
- [x] 2.2 Add repository path validation to enforce repo-relative addressing and reject traversal/escape attempts for all commands.
- [x] 2.3 Implement session-owned state container (`repo_root`, `HEAD` metadata, snapshot id, watcher handles) with safe lifecycle cleanup.

## 3. Git Status, Staging, and Diff Workflows

- [x] 3.1 Implement status command execution and parser for `git -C <repoRoot> --no-pager status --porcelain=v2 -z --untracked-files=all`.
- [x] 3.2 Implement stage/unstage operations for explicit file selections with `--` pathspec separation and structured success/error responses.
- [x] 3.3 Implement discard/revert actions for supported tracked-path cases with explicit confirmation gate and policy rejection for unsupported targets.
- [x] 3.4 Implement staged and unstaged diff retrieval endpoints with stable output handling suitable for UI diff panels.

## 4. Commit, Branch, and History Workflows

- [x] 4.1 Implement commit creation command with required input validation and structured failure classification.
- [x] 4.2 Implement branch listing endpoint with active-branch marker and stable metadata fields.
- [x] 4.3 Implement recent history endpoint with bounded results and deterministic metadata fields for list/detail views.
- [x] 4.4 Implement branch checkout with safety precondition checks and policy error handling for unsafe transitions.

## 5. Concurrency, Refresh, and Safety Controls

- [x] 5.1 Implement per-repository serialized mutation queue for stage/unstage/revert/commit/checkout operations.
- [x] 5.2 Implement debounced read queue and snapshot-based stale-response dropping for status/diff/branches/history refreshes.
- [x] 5.3 Add background refresh path using low-lock reads (including `--no-optional-locks` where applicable) plus watcher+timer fallback.
- [x] 5.4 Enforce operation allowlist and confirmation policy for destructive operation classes; deny non-allowlisted command requests.

## 6. Frontend Integration and Keyboard-First UX

- [x] 6.1 Build repository open/session UI flow and bind backend session lifecycle events.
- [x] 6.2 Build keyboard-first status/staging UI for staged, unstaged, and untracked sections with actionable shortcuts.
- [x] 6.3 Build commit panel with validation feedback and post-commit refresh behavior for status/history.
- [x] 6.4 Build branch/history views with checkout actions and clear safety/error messaging.

## 7. Verification, Fixtures, and Hardening

- [x] 7.1 Add backend tests for path boundary enforcement, allowlist rejection, and structured error payloads.
- [x] 7.2 Add parser/command integration tests using fixture repositories (including non-UTF8 path identity via `path_display` and stable `path_key`).
- [x] 7.3 Add end-to-end desktop flow tests for open repo, stage/unstage, commit, branch checkout safety, and recovery from Git command failures.
- [x] 7.4 Validate performance and reliability under rapid keyboard navigation and repeated refresh cycles; tune debounce/queue thresholds.
