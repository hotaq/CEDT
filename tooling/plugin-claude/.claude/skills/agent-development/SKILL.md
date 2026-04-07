---
name: agent-development
description: Guidelines for developing Claude Code agents, skills, and hooks. Use when creating or modifying .claude/agents/ or .claude/skills/.
---

# Agent Development Guide

## Directory Structure

```
.claude/
├── agents/                    # Sub-agents (YAML frontmatter + Markdown)
│   └── agent-name.md
├── skills/                    # Skills (directories with SKILL.md)
│   └── skill-name/
│       ├── SKILL.md          # Required - skill entry point
│       ├── examples/         # Optional - example outputs
│       ├── scripts/          # Optional - executable scripts
│       └── templates/        # Optional - templates
└── hooks/                     # Lifecycle hooks (optional)
```

## Agent Format (.claude/agents/)

```markdown
---
name: agent-name              # Required: lowercase, hyphens
description: When to use      # Required: trigger for delegation
tools: Read, Edit, Bash       # Optional: allowed tools
model: sonnet|opus|haiku      # Optional: default inherit
---

System prompt here...
```

## Skill Format (.claude/skills/)

Skills are directories with `SKILL.md` as the entry point:

```
skill-name/
├── SKILL.md           # Required - skill definition
├── examples.md        # Optional - usage examples
└── scripts/
    └── helper.py      # Optional - bundled scripts
```

### SKILL.md Structure

```yaml
---
name: skill-name              # Optional: defaults to directory name
description: When to use      # Recommended: for auto-invocation
disable-model-invocation: false  # Optional: prevent auto-use
user-invocable: true          # Optional: show in / menu
allowed-tools: Read, Grep     # Optional: auto-allow tools
context: fork                 # Optional: run in subagent
agent: Explore                # Optional: agent type for fork
---

Skill instructions here...
```

### Dynamic Context with `!command`

Use `!`command`` syntax to inject command output:

```markdown
---
name: git-status
description: Show current git status
---

Current git status:

!`git status --short`

Recent commits:

!`git log --oneline -5`
```

### Argument Substitution

Access arguments passed to skills:

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue #$ARGUMENTS.

Or access by position: First=$0, Second=$1
```

## Quick Reference

| Feature | Agents | Skills |
|---------|--------|--------|
| Location | `.claude/agents/` | `.claude/skills/<name>/` |
| Entry file | `*.md` | `SKILL.md` |
| Frontmatter | Yes | Yes |
| Supporting files | No | Yes |
| Invoked via | Auto / Explicit | `/name` or Auto |
| Runs in subagent | Always | With `context: fork` |

## Tool Selection Guide

| Agent/Skill Type | Recommended Tools |
|------------------|-------------------|
| Read-only reviewer | `Read, Grep, Glob` |
| Code analyzer | `Read, Bash, Grep, Glob` |
| Code modifier | `Read, Edit, Bash, Grep, Glob` |
| Full-featured | `Read, Edit, Write, Bash, Grep, Glob` |

## Best Practices

1. **Clear descriptions**: Help Claude know when to use your agent/skill
2. **Limit tools**: Grant minimum necessary permissions
3. **Use skills for**: Reference content, conventions, workflows
4. **Use agents for**: Complex tasks requiring isolation
5. **Supporting files**: Keep SKILL.md focused, move details to separate files
