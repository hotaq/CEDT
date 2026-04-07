# Pattern Checklist

Use this checklist only when you need help extracting a style profile quickly.

## Priority order

1. Explicit user instructions
2. User-provided examples
3. Same-directory or same-feature files
4. Repository-wide conventions
5. Language defaults

## What to inspect

- File names and module layout
- Type, trait, function, and variable naming
- Function signatures and return types
- Data ownership and lifetime patterns
- Error types, messages, and propagation style
- Control-flow shape: early return, `match`, helper extraction, nesting
- Imports, visibility, and item ordering
- Comments, doc comments, and example usage patterns
- Test organization, helpers, fixture reuse, and assertion style

## Escalate to the user when

- No representative example exists
- Multiple nearby files use incompatible patterns
- The requested style conflicts with correctness or project constraints
- A new file introduces a pattern not seen elsewhere
