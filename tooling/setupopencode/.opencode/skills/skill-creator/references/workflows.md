# Workflow Patterns

Use these patterns when designing skill instructions that require multiple steps.

## Sequential Workflows

For complex tasks, present a clear ordered flow near the start of `SKILL.md`:

```markdown
Implementing a new skill involves these steps:

1. Confirm trigger examples and exclusions
2. Create SKILL.md with valid frontmatter
3. Add only necessary resources (scripts/references/assets)
4. Validate name, path, and links
5. Test on a realistic user request
```

## Conditional Workflows

For branching logic, define decision points explicitly:

```markdown
1. Identify requested operation:
   **Create a new skill?** -> Follow "Creation workflow"
   **Update existing skill?** -> Follow "Iteration workflow"

2. Creation workflow: [steps]
3. Iteration workflow: [steps]
```

## Design Notes

- Keep branch conditions mutually exclusive when possible.
- Put high-risk decisions early in the flow.
- Avoid deeply nested branching; split to references when needed.
