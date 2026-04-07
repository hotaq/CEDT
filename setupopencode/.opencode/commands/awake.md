---
description: Load short-term project context and long-term agent memory
agent: build
subtask: false
---
You are running `/awake`.

Goal: prepare a working memory state before coding.

Do this in order:

1) Build short-term project memory (current workspace)
- Inspect the repository and provide a compact project snapshot:
  - stack/tools
  - important entry points
  - active branch and local git status
  - risky or high-impact files for upcoming edits
- Keep this section concise and path-first.

2) Load long-term memory (cross-session learnings)
- Search for prior memories/patterns relevant to this project, user preferences, and recurring constraints.
- If memory tooling is available, retrieve and summarize it as:
  - known user preferences
  - project conventions
  - past pitfalls to avoid
- If nothing is found, say "No long-term memory found yet".

3) Produce an Awake Brief
- Return exactly these sections:
  - Short-Term Snapshot
  - Long-Term Memory
  - Immediate Guardrails
  - First 3 Recommended Actions

Rules:
- Do not modify files in `/awake` unless the user explicitly asks.
- Do not invent memories; mark unknowns clearly.
- If you discover valuable new stable preferences or patterns during later work, suggest saving them to long-term memory.
