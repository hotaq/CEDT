# Claude Code Sub-Agents Framework

A framework for creating, managing, and distributing custom sub-agents and skills for Claude Code.

## Overview

This project provides:
- **Sub-Agents** (`.claude/agents/`) - Specialized AI agents that run in isolated contexts
- **Skills** (`.claude/skills/`) - Reusable knowledge and workflows that extend Claude's capabilities
- **Hooks** (`.claude/hooks/`) - Lifecycle automation and validation
- **Documentation** (`docs/`) - Complete guides and best practices
- **Examples** (`examples/`) - Templates and working samples

## Quick Start

```bash
# List and manage agents
/agents

# Use an agent (automatic delegation by description)
"Review this code for security issues"
"Debug why the tests are failing"

# Invoke a skill
/project-info
/agent-development
```

## Project Structure

```
.claude/
├── agents/              # Sub-agents (single Markdown files)
│   ├── code-reviewer.md
│   ├── debugger.md
│   └── test-runner.md
├── skills/              # Skills (directories with SKILL.md)
│   ├── agent-development/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── git-helpers/
│   │   └── SKILL.md
│   └── project-info/
│       └── SKILL.md
└── settings.json        # Project settings

docs/                    # Documentation
├── creating-agents.md
├── agent-config.md
├── skills.md
├── hooks.md
└── best-practices.md

examples/                # Templates
├── agent-template.md
└── hook-validation.sh
```

## Agents vs Skills

| Feature | Agents | Skills |
|---------|--------|--------|
| **File Location** | `.claude/agents/*.md` | `.claude/skills/<name>/SKILL.md` |
| **Context** | Isolated subagent | Inline (or `context: fork` for isolation) |
| **Files** | Single Markdown file | Directory with supporting files |
| **Invocation** | Automatic by description | `/skill-name` or automatic |
| **Best For** | Complex tasks, isolation | Knowledge, workflows, utilities |

## Creating Agents

1. Copy the template:
   ```bash
   cp examples/agent-template.md .claude/agents/my-agent.md
   ```

2. Edit the frontmatter:
   ```yaml
   ---
   name: my-agent
   description: What this agent does. Use proactively when...
   tools: Read, Edit, Bash
   model: sonnet
   ---
   ```

3. Write the system prompt in the Markdown body

4. Test: Run `/agents` to reload, then invoke

## Creating Skills

1. Create the directory:
   ```bash
   mkdir -p .claude/skills/my-skill
   ```

2. Create `SKILL.md` with frontmatter and instructions:
   ```yaml
   ---
   name: my-skill
   description: When to use this skill
   ---

   Instructions here...
   ```

3. Add supporting files (optional): `examples.md`, `reference.md`, `scripts/`

4. Test: Invoke with `/my-skill`

## Features

### Dynamic Context in Skills

Use ``!`command` `` syntax to inject live data:

```yaml
---
name: git-status
---

Git status: !`git status --short`
Branch: !`git branch --show-current`
```

### Argument Substitution

Access arguments: `$ARGUMENTS`, `$0`, `$1`, etc.

```yaml
---
name: fix-issue
---

Fix GitHub issue #$ARGUMENTS
```

### Run Skills in Subagents

Add `context: fork` and `agent: Explore` for isolated execution:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS...
```

## Available Agents

| Agent | Purpose | Tools |
|-------|---------|-------|
| `code-reviewer` | Review code for quality/security | Read, Grep, Glob, Bash |
| `debugger` | Debug errors and fix issues | Read, Edit, Bash, Grep, Glob |
| `test-runner` | Run tests and report results | Bash, Read, Grep |

## Available Skills

| Skill | Purpose | Invocation |
|-------|---------|------------|
| `/agent-development` | Guidelines for creating agents | Manual |
| `/git-helpers` | Git utility commands | Manual |
| `/project-info` | Show project information | Manual/Auto |

## Documentation

- [Creating Agents](docs/creating-agents.md) - Step-by-step agent creation guide
- [Agent Configuration](docs/agent-config.md) - Frontmatter reference
- [Skills](docs/skills.md) - Skills development guide
- [Hooks](docs/hooks.md) - Validation and lifecycle hooks
- [Best Practices](docs/best-practices.md) - Design patterns and recommendations

## License

MIT
