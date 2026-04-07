---
name: match-code-style
description: Infer and follow user-provided or codebase-local coding style, naming, API shape, error handling, testing, and file organization. Use when a user asks to write code in their own style, mirror patterns from existing files, keep house conventions, or adapt new code to nearby examples before editing.
---

# Match Code Style

Build a style profile before writing code.

## Evidence priority

Apply evidence in this order:

1. Explicit user rules
2. User-provided snippets or tagged files
3. Nearby files in the same module or feature
4. Broader repository conventions
5. Language defaults

If the evidence is weak, missing, or contradictory, ask for one or two representative examples before making a broad change.

## Capture style signals

Review the concrete patterns that affect maintainability and reviewability:

- Naming: modules, types, functions, variables, test names
- API shape: constructors, builders, traits, handlers, helper boundaries
- Control flow: early returns, match usage, guard clauses, nesting depth
- Error handling: custom error types, `Result` aliases, context messages, panics vs propagation
- Data modeling: owned vs borrowed data, wrapper types, visibility choices
- Imports and layout: grouping, ordering, spacing, section comments, file structure
- Documentation tone: comments, doc comments, examples, omission of comments
- Testing style: fixture setup, assertion style, helper reuse, test placement

Read `references/pattern-checklist.md` when you need a compact review list.

## Implementation rules

- Match the nearest relevant pattern instead of rewriting code into a generic style.
- Reuse existing helpers, macros, traits, and error types before introducing new abstractions.
- Keep diffs minimal for edits; preserve local formatting and surrounding structure.
- For new files, model the file after the closest analogous file in the codebase.
- When the user provides a direct style instruction, treat it as binding unless it conflicts with correctness.
- If two style sources conflict, follow the higher-priority source and mention the conflict briefly.

## Validation

Before finishing:

1. Compare the new or edited code against the nearest style examples.
2. Check that names, signatures, and test patterns align with neighboring code.
3. Run relevant tests, builds, or linters when the task requires verification.
4. Prefer fixing style mismatches at the source instead of explaining them away.

## Final response behavior

In the final response for a coding task:

- Briefly mention the main patterns you matched.
- Cite the representative files that informed the implementation.
- Call out any places where style guidance was missing and how you resolved it.
