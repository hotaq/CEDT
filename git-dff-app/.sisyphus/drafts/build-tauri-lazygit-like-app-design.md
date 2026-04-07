## Context

We are building a Tauri desktop application that provides a LazyGit-like, keyboard-first UI for interacting with a local Git repository. The proposal defines core capabilities: repository session, status + staging, commit flow, branch/history browsing, and safety guardrails.

Constraints:
- Tauri (Rust backend + web UI) trust boundary: the webview is untrusted; Git and filesystem operations must be mediated by the Rust backend.
- Cross-platform behavior must be consistent across macOS/Windows/Linux.
- Repository paths, branch names, commit messages, and file names must be treated as untrusted input (sanitization + validation).

## Goals / Non-Goals

**Goals:**
- Provide a reliable "open repository" flow that validates a Git repo root and maintains an active repository session.
- Provide core LazyGit-like local workflows:
  - View status (staged/unstaged/untracked)
  - Stage/unstage/revert file changes
  - View diffs for selected paths
  - Create commits with message validation and clear results/errors
  - Browse branches and recent commit history; checkout branches
- Make risky operations safe by default via confirmations and clear error surfaces.
- Keep Git orchestration centralized in Rust with a single, auditable gateway API.

**Non-Goals:**
- Full LazyGit parity in v1 (rebase/merge UI, conflict resolution, stash workflows, submodules, reflog tools).
- Remote operations UI (fetch/pull/push) and authentication UI in v1.
- Bundling an embedded Git distribution in v1 (assume system `git` is available; show actionable error if missing).

## Decisions

### Decision 1: Git integration uses CLI `git` executed from Rust (not libgit2) for v1

We will execute the system `git` binary via `std::process::Command` from Rust, passing arguments as an array (never through a shell string).

Implementation guardrails:
- Always run Git with an explicit repo root via `git -C <repoRoot> ...` (never rely on process CWD).
- Always pass `--` before pathspec arguments to avoid interpreting file names as options.
- Prefer machine-readable outputs:
  - Status: `git -C <repoRoot> status --porcelain=v2 -z --untracked-files=all`
  - Use `-z` where available to make parsing robust for special characters.
- For periodic/background refresh, consider `--no-optional-locks` to reduce lock contention.

Rationale:
- Maximizes compatibility with real Git behavior (credential helpers, config, hooks, Git LFS, edge cases) and avoids known libgit2 authentication/SSH pitfalls.
- Keeps the frontend free of command execution capabilities; the backend exports a constrained set of operations.

Alternatives considered:
- `libgit2`/`git2` crate: better performance for frequent small operations, but has documented auth/SSH and parity gaps; would require custom credential handling.
- Hybrid (libgit2 for local ops, CLI for auth/remote): viable later if performance requires; adds complexity.
- `gix` (gitoxide): promising pure-Rust alternative, but still maturing; defer until requirements stabilize.

### Decision 2: Single Rust Git gateway API (no generic "run command" surface)

Implement a `GitService` (name indicative) that exposes high-level operations only:
- `open_repo(path)`
- `status()`
- `diff(path, options)`
- `stage(paths)` / `unstage(paths)` / `revert(paths)`
- `commit(message, options)`
- `branches()` / `history(limit, ...)` / `checkout(branch)`

Rules:
- Canonicalize and validate the repo root once per session; reject any operation that attempts to access paths outside the repo root.
- Validate refs/branch names and sanitize all strings displayed in the webview.
- Maintain a strict allowlist of supported Git subcommands and flags.

### Decision 3: Concurrency + state model uses snapshots, eventing, and a per-repo mutation queue

To avoid race conditions and index lock conflicts:
- Create a per-repo worker with a serialized queue for mutating operations (stage/unstage/revert/commit/checkout).
- Allow bounded parallel reads (status/log/diff) but debounce/coalesce refresh triggers.
- Represent state as a versioned snapshot; frontend ignores stale responses (request id + snapshot id).

### Decision 4: Safety model for destructive actions

Define a safety policy:
- Classify operations as safe vs risky.
- Require explicit confirmation for risky operations (e.g., revert/discard changes, force-like operations).
- Prefer non-destructive defaults (e.g., do not run `git reset --hard`).
- Map Git errors to user-facing error categories with actionable guidance.

### Decision 5: Cross-platform and environment assumptions

- Assume system `git` exists on PATH for v1; on startup, run a lightweight `git --version` check and surface guidance if missing.
- Handle path edge cases (case sensitivity differences, Windows path separators) by canonicalizing paths and using Rust `Path` APIs.
- Avoid parsing porcelain output that is unstable; prefer stable forms like `--porcelain=v2` for status.


## Risks / Trade-offs

- [Performance: spawning many processes] -> Mitigation: debounce, batch operations, use porcelain outputs, and cache snapshots.
- [Credential prompts block remote ops] -> Mitigation: keep v1 local-only; later, rely on system credential helpers or design an explicit auth story.
- [Parsing Git output brittleness] -> Mitigation: use stable, machine-readable formats where possible (`--porcelain=v2`, structured diff options); centralize parsing in Rust.
- [Index.lock conflicts under rapid UI actions] -> Mitigation: serialized mutation queue and cancellation tokens.
- [Security: path traversal or command injection] -> Mitigation: arg-array execution only, allowlist subcommands, canonicalize paths, deny traversal, sanitize rendered strings.
