## ADDED Requirements

### Requirement: Branch creator MUST create validated local branches
The system MUST allow users to create a new local branch from the active repository session with validation for branch name and repository state constraints.

#### Scenario: Create local branch successfully
- **WHEN** the user submits a valid new branch name
- **THEN** the system creates the local branch and returns success with updated branch context

#### Scenario: Reject invalid branch name
- **WHEN** the user submits a branch name that violates branch naming rules
- **THEN** the system rejects the request with a validation error and no branch is created

### Requirement: Branch creator MUST refresh branch-facing UI state
The system MUST refresh branch listing and active branch indicators after branch creation outcomes.

#### Scenario: Refresh branch list after creation
- **WHEN** branch creation succeeds
- **THEN** the UI receives updated branch list data including the new branch and active marker state

#### Scenario: Preserve state on creation failure
- **WHEN** branch creation fails
- **THEN** the UI preserves existing branch state and shows actionable failure guidance
