# Agent Configuration Reference

## Frontmatter Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique identifier (lowercase, hyphens) |
| `description` | string | When Claude should delegate to this agent |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `tools` | array | All | Allowed tools (allowlist) |
| `disallowedTools` | array | - | Denied tools (denylist) |
| `model` | string | inherit | Model: sonnet, opus, haiku, inherit |
| `permissionMode` | string | default | Permission handling mode |
| `skills` | array | - | Skills to preload |
| `hooks` | object | - | Lifecycle hooks |

## Tools

Available tools for agents:

- `Read` - Read files
- `Write` - Create new files
- `Edit` - Modify existing files
- `Bash` - Execute shell commands
- `Grep` - Search file contents
- `Glob` - Find files by pattern
- `Task` - Spawn subagents (but agents cannot spawn other agents)

## Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Standard permission checking with prompts |
| `acceptEdits` | Auto-accept file edits |
| `dontAsk` | Auto-deny permission prompts |
| `bypassPermissions` | Skip all permission checks (use with caution) |
| `plan` | Read-only exploration mode |

## Example Configurations

### Read-Only Reviewer

```yaml
---
name: code-reviewer
description: Reviews code without making changes
tools: Read, Grep, Glob
model: haiku
---
```

### Full-Access Debugger

```yaml
---
name: debugger
description: Fixes bugs and errors
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
permissionMode: acceptEdits
---
```

### Database Reader with Hooks

```yaml
---
name: db-reader
description: Executes read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly.sh"
---
```
