---
name: skill-creator
description: Create or improve OpenCode agent skills with correct SKILL.md frontmatter, directory layout, trigger descriptions, and optional bundled resources (scripts, references, assets). Use when asked to build, port, audit, or refactor a skill.
compatibility: opencode
license: Apache-2.0
---

# Skill Creator

Create robust, reusable OpenCode skills that are easy to discover and safe to run.

## Core Rules

1. Follow OpenCode skill placement and naming rules exactly.
2. Keep metadata short, specific, and trigger-oriented.
3. Keep SKILL.md focused on operational guidance, not process diaries.
4. Use progressive disclosure: put long details in `references/` and point to them from SKILL.md.
5. Include only files that improve task execution.

## OpenCode Skill Requirements

Apply these requirements for every skill:

- Place skill at one of:
  - `.opencode/skills/<name>/SKILL.md`
  - `.claude/skills/<name>/SKILL.md`
  - `.agents/skills/<name>/SKILL.md`
- Ensure frontmatter includes at least:
  - `name` (required)
  - `description` (required)
- Optional frontmatter fields:
  - `license`
  - `compatibility`
  - `metadata` (string-to-string map)
- Keep `name` regex-compatible: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Match `name` with the containing directory name.
- Keep `description` specific enough for trigger selection (1-1024 chars).

## Creation Workflow

Follow this sequence unless user requests a different order.

1. Clarify scope from examples
   - Ask for concrete examples of user prompts that should trigger the skill.
   - Confirm exclusions: what the skill should not handle.

2. Design reusable contents
   - `scripts/` for deterministic, repeatable operations.
   - `references/` for long docs, schemas, or policies.
   - `assets/` for templates and output resources.

3. Scaffold files
   - Create the skill directory and `SKILL.md`.
   - Add only required support files.

4. Write SKILL.md
   - Frontmatter first.
   - Body should be imperative and action-oriented.
   - Put trigger conditions in `description`, not in a long "when to use" narrative.
   - Link reference files directly from SKILL.md when details are split out.

5. Validate
   - Verify frontmatter keys and name constraints.
   - Verify directory/name match.
   - Verify links to files in `references/`, `scripts/`, and `assets/` resolve.
   - Remove scaffolding placeholders not used by the final skill.

6. Iterate from usage
   - Capture failure modes.
   - Tighten instructions or add narrowly scoped references.
   - Avoid bloating SKILL.md.

## Writing Pattern

Use this template structure:

```md
---
name: <skill-name>
description: <what it does + concrete trigger contexts>
compatibility: opencode
---

# <Title>

## Core Rules
- <non-negotiable constraints>

## Workflow
1. <step>
2. <step>

## Resources
- For workflow patterns, see `references/workflows.md`.
- For output-format patterns, see `references/output-patterns.md`.
```

## Quality Bar

A skill is complete when:

- Name and directory match and validate.
- Description can reliably trigger correct use.
- Instructions are concise and executable.
- Resource files exist only if they provide clear value.
- No extra docs like README/CHANGELOG are added unless user explicitly requests them.

## Reference Files in This Skill

- Use `references/workflows.md` for sequencing and branching patterns.
- Use `references/output-patterns.md` for enforcing output shape and quality.
