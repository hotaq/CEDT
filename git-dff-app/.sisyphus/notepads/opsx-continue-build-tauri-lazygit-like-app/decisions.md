# Decisions

## 2026-02-24

- V1 Git integration uses system `git` CLI executed from Rust (`std::process::Command` arg arrays); avoid libgit2/gitoxide until profiling/requirements justify.
- Enforce trust boundary: webview is untrusted; all Git/filesystem ops go through allowlisted Tauri commands (no shell plugin, no generic "run" API).
- Standard guardrails: always `git -C <repoRoot>`, always pass `--` before pathspec, prefer `--porcelain=v2 -z`, use `--no-optional-locks` for background status refresh.
- Consistency model: per-repo serialized mutation queue + debounced reads; snapshot ids/request ids; drop stale responses.
- Non-UTF8 paths: represent as `path_display` (lossy) + `path_key` (stable byte identity, e.g., base64) so UI can round-trip selections safely.
