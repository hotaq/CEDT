# Skills

## Overview

Skills extend Claude's capabilities with reusable knowledge and workflows. Unlike agents (which run in isolated subagents), skills run inline in your conversation context.

**Key differences from agents:**
- Skills run in your main conversation context (not isolated)
- Skills can be invoked with `/skill-name` or automatically by Claude
- Skills support dynamic context with `!command` syntax
- Skills are directories with supporting files

## Directory Structure

```
.claude/skills/
└── skill-name/
    ├── SKILL.md           # Required - entry point
    ├── examples.md        # Optional - usage examples
    ├── reference.md       # Optional - detailed docs
    └── scripts/           # Optional - bundled scripts
        └── helper.py
```

## Creating Skills

### Basic Skill

Create `~/.claude/skills/my-skill/SKILL.md`:

```yaml
---
name: my-skill              # Defaults to directory name
description: When to use    # Helps Claude auto-invoke
---

Skill instructions here...
```

### Skill with Frontmatter Options

```yaml
---
name: skill-name
description: What this skill does and when to use it
disable-model-invocation: false   # Prevent auto-invocation
user-invocable: true              # Show in / menu
allowed-tools: Read, Grep         # Auto-allow these tools
context: fork                     # Run in subagent
agent: Explore                    # Agent type for fork
---

Instructions here...
```

## Dynamic Context with `!command`

Use ``!`command` `` syntax to inject command output before Claude sees the skill:

```yaml
---
name: git-status
description: Show current git status
---

Git status:

!`git status --short`

Recent commits:

!`git log --oneline -5`
```

## Argument Substitution

Access arguments passed when invoking:

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments as string |
| `$ARGUMENTS[0]`, `$0` | First argument |
| `$ARGUMENTS[1]`, `$1` | Second argument |

Example:

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue #$ARGUMENTS.

1. Read the issue: !`gh issue view $ARGUMENTS`
2. Understand requirements
3. Implement fix
```

Usage: `/fix-issue 123`

## Invocation Control

| Frontmatter | You can invoke | Claude can invoke |
|-------------|----------------|-------------------|
| (default) | Yes (`/name`) | Yes (auto) |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

## Running Skills in Subagents

Add `context: fork` to run in isolation:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS:
1. Find relevant files
2. Analyze code
3. Summarize findings
```

## Supporting Files

Reference supporting files from SKILL.md:

```markdown
## Additional Resources

- For API details: see [reference.md](reference.md)
- For examples: see [examples.md](examples.md)
```

## Best Practices

1. **Keep SKILL.md under 500 lines** - Move details to supporting files
2. **Write clear descriptions** - Helps Claude auto-invoke appropriately
3. **Use `!command` for live data** - Git status, file listings, etc.
4. **Use `disable-model-invocation: true`** for side-effect workflows
5. **Use `context: fork`** for operations that should be isolated

## Examples

See `.claude/skills/` in this project for working examples:
- `agent-development/` - Guidelines for creating agents
- `git-helpers/` - Git utility commands
- `project-info/` - Project information and status
