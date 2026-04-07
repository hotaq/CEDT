# Output Patterns

Use these patterns when a skill needs consistent output quality.

## Template Pattern (Strict)

Use when output shape must be exact (for example, changelog blocks, API payload examples, or compliance reports).

```markdown
## Output format

Always return this exact structure:

# <Title>

## Summary
<single paragraph>

## Findings
- <finding 1>
- <finding 2>

## Actions
1. <action 1>
2. <action 2>
```

## Template Pattern (Flexible)

Use when adaptation is expected.

```markdown
## Output format

Use this as default shape, then adapt sections to context:

# <Title>
## Summary
## Key Points
## Next Steps
```

## Examples Pattern

For style-sensitive outputs, provide input/output pairs in the skill:

```markdown
Example input: "Fix bug in login rate limiter"
Example output:
fix(auth): correct login rate limiter window handling

Prevent premature counter reset across minute boundaries.
```

Examples outperform long prose when quality depends on tone and structure.
