---
name: project-info
description: Show information about this project. Use when exploring a new codebase or when asked about project structure.
---

# Project Information

## Overview

This is the **Claude Code Sub-Agents Framework** - a project for creating custom sub-agents and skills.

## Current State

Repository root: !`pwd`

Git branch: !`git branch --show-current 2>/dev/null || echo "Not a git repository"`

## Structure

```
.claude/
├── agents/           # Sub-agents (YAML + Markdown)
├── skills/           # Skills (directories with SKILL.md)
└── settings.json     # Project settings
docs/                 # Documentation
examples/             # Templates
```

## Available Agents

!`ls -1 .claude/agents/ 2>/dev/null | sed 's/.md$//' || echo "No agents found"`

## Available Skills

!`ls -1 .claude/skills/ 2>/dev/null || echo "No skills found"`
