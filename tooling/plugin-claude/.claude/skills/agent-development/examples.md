# Agent Development Examples

## Simple Read-Only Agent

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices. Use proactively after writing or modifying code.
tools: Read, Grep, Glob
model: haiku
---

You are a code reviewer. When invoked:
1. Run git diff to see recent changes
2. Review modified files
3. Check for: readability, naming, duplication, error handling
4. Provide specific, actionable feedback
```

## Skill with Dynamic Context

```markdown
---
name: pr-summary
description: Summarize pull request changes
context: fork
agent: Explore
---

## PR Context
- Diff: !`gh pr diff`
- Files changed: !`gh pr diff --name-only`
- Recent commits: !`git log --oneline -10`

## Task
Summarize the changes, focusing on:
1. What changed and why
2. Potential risks
3. Testing recommendations
```

## Skill with Arguments

```markdown
---
name: create-component
description: Create a new React component
disable-model-invocation: true
---

Create a new React component named `$0`.

## Requirements
- Component location: `src/components/$0/$0.jsx`
- Styles: `src/components/$0/$0.css`
- Test: `src/components/$0/$0.test.jsx`
- Follow existing component patterns
```

Usage: `/create-component Button`

## Agent with Hooks

```markdown
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly.sh"
---

Execute SELECT queries to answer questions about data.
```
