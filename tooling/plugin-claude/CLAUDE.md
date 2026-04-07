# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code Sub-Agents Framework** - a project for creating, managing, and distributing custom sub-agents and skills for Claude Code.

## Project Structure

```
.claude/
├── agents/              # Sub-agents (Markdown files with YAML frontmatter)
│   ├── code-reviewer.md
│   ├── debugger.md
│   └── test-runner.md
├── skills/              # Skills (directories with SKILL.md entry point)
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

## Common Commands

```bash
# List and manage agents
/agents

# Use an agent (automatic delegation)
"Review this code"
"Debug this error"

# Invoke a skill
/project-info
/git-helpers

# Create new agent
cp examples/agent-template.md .claude/agents/my-agent.md

# Create new skill
mkdir -p .claude/skills/my-skill
touch .claude/skills/my-skill/SKILL.md
```

## Agent vs Skill

| Feature | Agents | Skills |
|---------|--------|--------|
| **Location** | `.claude/agents/*.md` | `.claude/skills/<name>/SKILL.md` |
| **Context** | Isolated subagent | Inline (or `context: fork`) |
| **Files** | Single file | Directory with supporting files |
| **Invocation** | Automatic by description | `/name` or automatic |
| **Use for** | Complex tasks, isolation | Knowledge, workflows, utilities |

## Agent Development

### Quick Start

1. **Copy template**: `cp examples/agent-template.md .claude/agents/my-agent.md`
2. **Edit frontmatter**: name, description, tools, model
3. **Write prompt**: Add system instructions in Markdown body
4. **Test**: Run `/agents` to reload, then invoke

### Agent Format

```markdown
---
name: agent-name
description: When to use this agent. Use proactively when...
tools: Read, Edit, Bash, Grep, Glob
model: sonnet|opus|haiku|inherit
---

System prompt here...
```

## Skill Development

### Quick Start

1. **Create directory**: `mkdir -p .claude/skills/my-skill`
2. **Create SKILL.md**: Add frontmatter and instructions
3. **Add supporting files** (optional): examples, scripts, templates
4. **Test**: Invoke with `/my-skill` or let Claude auto-invoke

### Skill Format

```yaml
---
name: skill-name
description: When to use this skill
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Grep
context: fork          # Run in subagent
agent: Explore         # Agent type for fork
---

Instructions here...

Dynamic content: !`git status --short`
Arguments: $ARGUMENTS or $0, $1
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

## Key Patterns

### Read-Only Agents
- Tools: `Read, Grep, Glob`
- Use for: Code review, analysis, research

### Code Modifying Agents
- Tools: `Read, Edit, Bash, Grep, Glob`
- Use for: Debugging, refactoring, fixing

### Reference Skills
- Use for: Conventions, patterns, documentation
- Claude loads automatically when relevant

### Task Skills
- Add `disable-model-invocation: true`
- Use for: Workflows with side effects (deploy, commit)
- Invoke manually with `/skill-name`

### Research Skills
- Add `context: fork` and `agent: Explore`
- Use for: Isolated exploration tasks

## Documentation

- `docs/creating-agents.md` - Agent creation guide
- `docs/agent-config.md` - Configuration reference
- `docs/skills.md` - Skills development guide
- `docs/hooks.md` - Validation and lifecycle hooks
- `docs/best-practices.md` - Design patterns
