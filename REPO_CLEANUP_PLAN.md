# Repo Cleanup Plan

## Goals
- Group the many top-level entries into a few predictable buckets.
- Keep project internals unchanged; only reorganize the root layout.
- Preserve the imported workspace snapshot while making browsing easier.
- Refresh root docs and ignore rules so the new layout remains maintainable.

## Planned buckets
- `academic/` — coursework, class exercises, and assignment repos
- `apps/` — app/product repos and runnable projects
- `experiments/` — scratch work and AI/competition experiments
- `tooling/` — utilities, configs, plugins, and developer tooling repos
- `assets/` — top-level binary assets and archives

## Guardrails
- No project code deletion beyond already-excluded generated/runtime artifacts.
- Keep AGENTS files with their projects.
- Update `.gitignore`, `EXCLUDED_LARGE_FILES.txt`, and root `README.md` after the move.
