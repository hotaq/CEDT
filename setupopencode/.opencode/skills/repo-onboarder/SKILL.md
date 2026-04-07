---
name: repo-onboarder
description: Quickly onboard to an unfamiliar repository by mapping tech stack, run commands, architecture entry points, and safe edit zones. Use when a task starts with "understand this repo", "where should I change", or "how is this project organized".
compatibility: opencode
license: Apache-2.0
---

# Repo Onboarder

Build a fast, reliable mental model of a repository before implementing changes.

## Core Rules

1. Prefer evidence from repository files over assumptions.
2. Start broad, then narrow to task-relevant modules.
3. Identify executable commands before proposing code edits.
4. Report uncertainty explicitly and suggest the next file to inspect.
5. Keep output concise, path-first, and action-oriented.

## Workflow

1. Detect stack and tooling
   - Read root manifests and config files (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, linters, formatter configs).
   - Record languages, package manager, framework, test runner, and build system.

2. Map runnable commands
   - Extract setup, dev, test, lint, and build commands from scripts/docs.
   - Note missing commands and safest fallback checks.

3. Locate architecture entry points
   - Find app bootstraps, routing boundaries, API handlers, and persistence layers.
   - Trace one representative end-to-end path (input to output).

4. Identify edit surfaces for the user request
   - List the primary files likely to change and adjacent risk files.
   - Highlight existing patterns to follow and anti-patterns to avoid.

5. Produce onboarding brief
   - Return: stack snapshot, command cheat sheet, architecture map, "where to edit", and open questions.
   - Keep each section short and reference concrete paths.

## Output Contract

Return results in this exact section order:

1. `Stack Snapshot`
2. `Runbook`
3. `Architecture Map`
4. `Edit Plan`
5. `Open Questions`

Each section must include file paths when applicable.

## Guardrails

- Do not modify files unless explicitly asked to implement.
- Do not invent scripts/commands that are not present.
- Do not over-explore unrelated modules once enough evidence is gathered.
- Stop when additional search yields no meaningful new context.
