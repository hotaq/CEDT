# Creating Agents

## Quick Start

### Using `/agents` Command

The easiest way to create an agent:

```bash
/agents
# Select "Create new agent" → "Project-level"
```

### Manual Creation

Create a Markdown file in `.claude/agents/`:

```markdown
---
name: my-agent
description: What this agent does and when to use it
tools: Read, Edit, Bash
model: sonnet
---

Your system prompt here...
```

## File Format

Agents are Markdown files with YAML frontmatter:

```markdown
---
name: agent-name           # Required: lowercase, hyphens
description: string        # Required: when to use this agent
tools: []                  # Optional: allowed tools
disallowedTools: []        # Optional: denied tools
model: sonnet|opus|haiku|inherit  # Optional: default inherit
permissionMode: string     # Optional: default, acceptEdits, dontAsk, bypassPermissions, plan
skills: []                 # Optional: skills to preload
hooks: {}                  # Optional: lifecycle hooks
---

System prompt (Markdown body)
```

## Best Practices

### 1. Clear Descriptions

Claude uses the description to decide when to delegate. Be specific:

```yaml
# Good
description: Code reviewer specializing in security vulnerabilities. Use proactively after any authentication or authorization code changes.

# Bad
description: A code reviewer
```

### 2. Limit Tool Access

Only give agents the tools they need:

- **Read-only agents**: `Read, Grep, Glob`
- **Code modifiers**: `Read, Edit, Grep, Glob`
- **Full access**: `Read, Edit, Write, Bash, Grep, Glob`

### 3. Model Selection

- `haiku`: Fast, low-cost; good for simple, focused tasks
- `sonnet`: Balanced capability and speed; good for most agents
- `opus`: Most capable; use for complex reasoning tasks
- `inherit`: Use parent's model (default)

### 4. Naming Conventions

- Use kebab-case: `code-reviewer`, `test-runner`
- Be descriptive: `security-auditor` not `auditor`
- Use verb-noun for actions: `debug-code`, `review-pr`

## Examples

See `examples/` directory for complete agent templates.
