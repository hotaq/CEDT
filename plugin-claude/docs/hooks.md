# Hooks & Validation

## Overview

Hooks allow you to run custom logic at specific points in an agent's lifecycle:

- **PreToolUse**: Before a tool executes
- **PostToolUse**: After a tool executes
- **Stop**: When the agent finishes

## Hook Types

### Command Hooks

Run a shell script or command:

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
```

### Built-in Hooks

| Event | When it fires |
|-------|---------------|
| `PreToolUse` | Before tool execution |
| `PostToolUse` | After tool execution |
| `Stop` | When agent completes |

## PreToolUse Validation

Use `PreToolUse` hooks to validate and block operations:

### Example: Read-Only Database Queries

```yaml
---
name: db-reader
description: Read-only database access
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

**validate-readonly-query.sh:**

```bash
#!/bin/bash
# Read JSON input from stdin
INPUT=$(cat)

# Extract command
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block write operations
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed" >&2
  exit 2
fi

exit 0
```

Make executable:
```bash
chmod +x ./scripts/validate-readonly-query.sh
```

## Exit Codes

| Code | Behavior |
|------|----------|
| 0 | Allow operation |
| 1 | Error (operation proceeds with warning) |
| 2 | Block operation (error shown to user) |

## Hook Input Format

Hooks receive JSON via stdin:

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "echo hello",
    "description": "Say hello"
  },
  "agent_type": "db-reader"
}
```

## Project-Level Hooks

Configure in `.claude/settings.json`:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup.sh" }
        ]
      }
    ]
  }
}
```
