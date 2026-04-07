# Best Practices

## Agent Design

### 1. Single Responsibility

Each agent should excel at one specific task:

```yaml
# Good - focused
code-reviewer: Reviews code
test-runner: Runs tests
debugger: Fixes bugs

# Bad - too broad
code-helper: Does various code things
```

### 2. Clear Descriptions

Help Claude know when to use your agent:

```yaml
# Good - specific trigger
description: Security auditor. Use proactively after any authentication, authorization, or data validation code changes.

# Bad - vague
description: A helpful agent for code
```

### 3. Appropriate Tool Access

Grant minimum necessary permissions:

| Agent Type | Recommended Tools |
|------------|-------------------|
| Reviewer | Read, Grep, Glob |
| Analyzer | Read, Bash, Grep, Glob |
| Modifier | Read, Edit, Bash, Grep, Glob |
| Full Access | All tools |

### 4. Model Selection

Choose based on task complexity:

- **Haiku**: Fast, focused tasks (search, pattern matching)
- **Sonnet**: Balanced (most agents)
- **Opus**: Complex reasoning (architecture, debugging)

## Workflow Patterns

### Parallel Research

```
Research authentication, database, and API modules in parallel using separate agents
```

### Chained Agents

```
Use code-reviewer to find issues, then use optimizer to fix them
```

### Isolated Operations

```
Use a subagent to run tests and report only failing tests
```

## Common Mistakes

### 1. Too Many Tools

Don't give agents tools they don't need. Restrict to essentials.

### 2. Vague Prompts

Be specific about what the agent should do and how.

### 3. Overlapping Responsibilities

Agents should have distinct purposes. Avoid duplication.

### 4. Ignoring Context

Agents start fresh. Don't assume they know your project.

## Version Control

Commit your agents to version control:

```bash
git add .claude/agents/
git commit -m "Add code-reviewer agent"
```

This allows:
- Team sharing
- Change tracking
- Code review of agents themselves

## Testing Agents

Test your agents before committing:

1. Create agent file
2. Restart Claude Code (or use `/agents` to reload)
3. Invoke with specific task
4. Verify behavior
5. Refine prompt and tools

## Maintenance

Regularly review and update agents:

- Remove unused agents
- Update prompts based on feedback
- Add new tools as capabilities expand
- Archive outdated patterns
