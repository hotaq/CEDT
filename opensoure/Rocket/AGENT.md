# Agent Guide

This file summarizes the repository-specific contribution rules in
[`CONTRIBUTING.md`](CONTRIBUTING.md) for coding agents. When there is any
conflict or ambiguity, follow `CONTRIBUTING.md`.

## Before You Change Code

- Read `CONTRIBUTING.md` first.
- Keep changes focused. Rocket does not accept cosmetic-only formatting or
  style churn.
- Prefer substantial improvements to functionality, testing, documentation,
  maintainability, performance, usability, or security.

## Working On Issues

- If you want to resolve an open issue, first check whether the issue already
  has a proposed solution.
- If there is no accepted direction, comment on the issue with a proposed
  solution before writing code. Include test cases or examples when possible.
- For unproposed features, do not implement them directly. Open or follow a
  feature request first and wait for feedback.
- Doc fixes, typos, and wording improvements can go straight to a PR.

## Quality Bar

All contributed code should be:

- Commented when functionality is complex or subtle.
- Documented when public API changes are introduced.
- Styled according to Rocket's conventions.
- Simple and idiomatic.
- Tested with convincing coverage for the changed behavior.
- Focused on the intended change only.

## Testing Expectations

- Start from a failing test when fixing a bug or implementing an accepted
  change.
- Run `./scripts/test.sh` before submitting work.
- Use targeted suites when appropriate:
  - `./scripts/test.sh --contrib` for `contrib/` changes.
  - `./scripts/test.sh --examples` for user-facing API changes or dependency
    updates.
  - `./scripts/test.sh --core` for feature-flag changes.
- If you modify codegen, run UI tests on stable and nightly:
  - `./scripts/test.sh +stable --ui`
  - `./scripts/test.sh +nightly --ui`
- If UI output changes are expected, regenerate with:
  - `TRYBUILD=overwrite ./scripts/test.sh +nightly --ui`
  - `TRYBUILD=overwrite ./scripts/test.sh +stable --ui`
- For bug fixes, add or update an integration or testbench test to prevent
  regressions.
- Bug-fix integration tests should be named
  `short-issue-description-NNNN.rs`, where `NNNN` is the GitHub issue number.

## Docs And Examples

- If you change docs, verify the rendered output. API docs are built with
  `./scripts/mk-docs.sh`.
- Guide sources live in `docs/guide/`.
- Preserve surrounding Markdown formatting in docs. Keep lines under 80
  characters where practical.
- Guide cross-links should use relative links such as `../page#anchor`.
- Guide aliases that start with `@` are build-time shorthands and should be
  preserved where appropriate.
- If you modify an example, update the example README too.

## Code Style

- Do not run `rustfmt` or `cargo fmt` on this repository. Rocket explicitly
  does not use them.
- Follow the Rust Style Guide plus Rocket-specific rules from
  `CONTRIBUTING.md`.
- Always separate items with one blank line.
- Prefer `where` clauses over block-indented generics.
- Do not use multi-line imports. Use multiple single-line grouped imports
  instead.
- Order imports by distance from the current module:
  - standard library crates (`std`, `core`, `alloc`)
  - external crates
  - current crate imports
- Prefer `crate::` imports over `super::` when practical.

## Commit Messages

- Use a single-line imperative header of at most 50 characters.
- Follow the header with a descriptive body wrapped to 72 characters and a
  footer.
- The header should precisely describe the primary change and should not depend
  on issue context.
- Typical verbs include `Fix`, `Improve`, `Introduce`, `Add`, `Remove`,
  `Update`, and `Implement`.

## Practical Default Workflow

1. Read the relevant issue and `CONTRIBUTING.md`.
2. Confirm the change is accepted or propose an approach first.
3. Add a failing test or repro.
4. Implement the smallest focused fix.
5. Run the relevant test suite(s).
6. Update docs, doctests, UI test output, or example READMEs if needed.
