## Context

We are building a Tauri desktop application that provides a LazyGit-like, keyboard-first UI for local Git workflows. The proposal defines five core capabilities:

- `repository-session`: open/validate a local repository and maintain an active session.
- `git-status-staging`: show working tree status and support stage/unstage/revert actions.
- `commit-flow`: create commits with validation and clear feedback.
- `branch-and-history`: browse branches and recent history; checkout branches.
- `git-operation-safety`: confirmations, error surfaces, and non-destructive defaults.

This change introduces a new trust boundary: the webview (frontend) must be treated as untrusted. All filesystem and Git operations must be mediated by a constrained Rust backend command API.

Constraints and assumptions for v1:

- Local-only scope: no fetch/pull/push and no authentication UI.
- Use system `git` on PATH (no bundled Git distribution in v1); detect and surface actionable errors when missing.
- Cross-platform support (macOS/Windows/Linux) with careful path handling, watcher quirks, and non-UTF8 filenames.

## Goals / Non-Goals

**Goals:**

- Provide an "open repository" flow that resolves a repo root, validates it, and creates a stable session identifier.
- Provide a responsive status/staging UI backed by machine-readable Git outputs.
- Provide a commit creation flow that validates the message, runs the commit, and returns structured results.
- Provide branch list and recent history views, plus checkout.
- Provide a safety model that prevents accidental destructive actions and makes risky actions explicit.
- Centralize Git execution and parsing in Rust behind a small, auditable allowlist of operations.

**Non-Goals:**

- Full LazyGit parity (merge/rebase UI, conflict resolution, stash workflows, submodules, reflog).
- Remote operations (fetch/pull/push), credential prompts, or auth management.
- A generic "run arbitrary command" API to the backend.
- Perfect handling of every Git edge case in v1; prioritize correctness and safety for common local workflows.

## Decisions

### Trust boundary and Tauri security model

Decision: treat the webview as untrusted and expose only specific Rust commands for the five capabilities.

Guardrails:

1) Tauri trust boundary: webview untrusted; all Git/filesystem ops via Rust backend commands.
2) Git execution: Rust `std::process::Command` with arg arrays only; never shell strings.
3) Always use `git -C <repoRoot>`; always pass `--` before pathspec.
4) Prefer machine-readable outputs: `git status --porcelain=v2 -z --untracked-files=all`.
5) Background refresh: consider `git --no-optional-locks status` to reduce lock contention.
6) Concurrency: per-repo serialized mutation queue; debounced reads; snapshot ids; drop stale responses.
7) Safety: confirmation for destructive ops; no generic "run command" API.
8) Cross-platform concerns: git discovery, path handling, file watcher quirks, non-UTF8 paths.

Implementation approach:

- Use Tauri's command invocation with an explicit allowlist of commands and typed request/response DTOs; never return raw stdout to the frontend.
- Do not enable a shell execution plugin for the frontend. If any Tauri plugins are used, scope them to the minimum needed, and prefer backend-only access patterns.

Alternatives considered:

- Letting the frontend execute commands (shell plugin): rejected due to command injection risk and inability to enforce safety policies.
- Exposing a generic backend "run" endpoint: rejected; it prevents auditing and makes guardrails unenforceable.

### Git integration uses system `git` CLI executed from Rust

Decision: use the system `git` binary for v1, executed from Rust via `std::process::Command` with argument arrays.

Rationale:

- Matches real Git behavior across platforms (config, hooks, LFS, attribute handling) with fewer parity gaps.
- Keeps all parsing and safety policy in one place (Rust) rather than distributing logic across the UI.

Core execution rules:

- Build commands as `git` + args (no shell); prefer `git --no-pager` for commands that might invoke a pager.
- Always scope to the active repo root: `git -C <repoRoot> ...`.
- Always insert `--` before any pathspec values.
- Capture stdout/stderr as bytes; parse machine-readable outputs from stdout only.

Alternatives considered:

- libgit2 (`git2` crate): better in-process performance, but introduces auth/SSH and parity complexity; defer until we have profiling data and a stronger remote story.
- gitoxide (`gix`): promising pure-Rust approach, but still evolving; defer until requirements stabilize.

### Repository session model and path safety

Decision: represent the active repository as a backend-owned session with a canonical repo root and a session id.

Implementation approach:

- `open_repo(input_path)` runs `git -C <input_path> rev-parse --show-toplevel` to resolve the true root.
- Canonicalize the returned root using Rust `Path`/`canonicalize` (best-effort on platforms where canonicalization may fail on missing components).
- Store session state keyed by `session_id` with: `repo_root`, last known `HEAD` oid/ref, last status snapshot id, and any watcher handles.
- All path inputs from the frontend are treated as untrusted and must be validated:
  - Accept only repo-relative paths.
  - Join against `repo_root` and reject traversal or paths that escape the root.
  - Always pass validated relative paths to Git commands after `--`.

Alternatives considered:

- Passing repo_root with every request from the frontend: rejected; it expands the attack surface and makes validation harder.

### Data model and parsing strategy (machine-readable first)

Decision: prefer stable, machine-readable Git outputs; parse in Rust into structured snapshots.

Status:

- Use `git -C <repoRoot> --no-pager status --porcelain=v2 -z --untracked-files=all`.
- Parse NUL-delimited records. Build a normalized status model with:
  - file path identity (see non-UTF8 handling), staged/unstaged state, and status codes.
  - separate lists for staged, unstaged, untracked.

Diff:

- Unstaged diff: `git -C <repoRoot> --no-pager diff --no-color --no-ext-diff -- <path>`.
- Staged diff: `git -C <repoRoot> --no-pager diff --cached --no-color --no-ext-diff -- <path>`.

Branches and history:

- Branches: prefer `git for-each-ref refs/heads --format=...` with a parse-friendly delimiter format.
- Recent commits: `git log -n <N> --date=iso-strict --pretty=format:...` with ASCII record separators (avoid fragile whitespace parsing).

Alternatives considered:

- Parsing human-readable `git status`: rejected; unstable across versions and locales.

### Background refresh and file watching

Decision: combine debounced refresh triggers with periodic polling; prefer low-lock Git reads.

Implementation approach:

- Trigger refresh on:
  - UI events (selection changes, completed mutations).
  - filesystem signals (where reliable) using a cross-platform watcher.
  - a low-frequency timer as fallback.
- For background reads, use `git -C <repoRoot> --no-pager --no-optional-locks status ...` to reduce contention.
- Debounce refresh requests in the backend to prevent spawning many processes during rapid key navigation.

Alternatives considered:

- Watch everything and never poll: rejected; watcher behavior differs across platforms and network filesystems.

### Concurrency and consistency model

Decision: serialize mutating Git operations per repository; debounce/coalesce read operations; use snapshot ids to drop stale responses.

Implementation approach:

- Create a per-repo worker that owns:
  - a mutation queue for stage/unstage/revert/commit/checkout.
  - a debounced read queue for status/diff/branches/history.
- Each response includes `session_id`, `request_id`, and `snapshot_id`.
- Frontend state updates only if `snapshot_id` is newer than the currently applied snapshot.
- If a mutation is in progress, optionally block new mutations and allow reads to proceed using the last stable snapshot.

Alternatives considered:

- Allowing concurrent mutations: rejected; increases likelihood of `index.lock` conflicts and confusing UI state.

### Safety policy for destructive operations

Decision: classify operations and require explicit confirmations for destructive actions; avoid irreversible defaults.

Implementation approach:

- Define an allowlisted set of operations (examples):
  - Stage: `git add -- <paths>`
  - Unstage: `git restore --staged -- <paths>`
  - Discard working tree changes (tracked only): `git restore --worktree --source=HEAD -- <paths>`
  - Commit: `git commit -m <message>`
  - Checkout: `git checkout <branch>` (or `git switch <branch>` if we standardize on it)
- Require confirmation for discard/revert operations and for any operation that can remove data.
- Keep v1 local-only; do not introduce remote operations that can block on credential prompts.

Alternatives considered:

- Using `git reset --hard` for discard: rejected; too broad and easy to misuse.

### Cross-platform and non-UTF8 path handling

Decision: treat Git output as bytes and preserve identity for non-UTF8 paths.

Implementation approach:

- Parse `-z` outputs as byte sequences.
- When sending paths to the frontend, include:
  - `path_display`: lossy UTF-8 rendering for UI.
  - `path_key`: a stable identifier (e.g., base64 of raw bytes) used in subsequent requests.
- Backend resolves `path_key` back to raw bytes/OsString (or rejects if invalid) and then validates it as repo-relative before use.

Alternatives considered:

- Assuming UTF-8 paths everywhere: rejected; breaks on some filesystems and real-world repos.

## Risks / Trade-offs

- [Git not installed / not on PATH] -> Mitigation: detect on startup (`git --version`) and show clear install guidance per OS.
- [Process spawn overhead] -> Mitigation: debounce/coalesce reads; cache snapshots; avoid pagers; keep outputs machine-readable.
- [index.lock contention under rapid actions] -> Mitigation: per-repo serialized mutation queue; use `--no-optional-locks` for background reads.
- [Output parsing brittleness across Git versions] -> Mitigation: prefer porcelain v2 + `-z`; keep parsing centralized and covered by fixture tests.
- [Watcher unreliability (network FS, platform quirks)] -> Mitigation: treat watchers as hints; keep periodic polling fallback.
- [Command injection / path traversal] -> Mitigation: arg-array execution only; session-owned repo_root; validate all ref/path inputs; always use `--` before pathspec.
- [Non-UTF8 paths complicate UI] -> Mitigation: dual representation (`path_display` + `path_key`) and backend-only resolution.
