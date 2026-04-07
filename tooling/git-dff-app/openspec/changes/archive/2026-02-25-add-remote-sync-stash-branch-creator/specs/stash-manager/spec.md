## ADDED Requirements

### Requirement: Stash manager MUST support save and list workflows
The system MUST allow users to save current working changes to stash and list existing stash entries for the active repository.

#### Scenario: Save stash entry from working tree
- **WHEN** the user requests stash save with a message
- **THEN** the system creates a stash entry and returns updated stash list metadata

#### Scenario: List stash entries
- **WHEN** the user opens stash manager view
- **THEN** the system returns stash entries in deterministic order with identifiers and display metadata

### Requirement: Stash manager MUST support apply and pop workflows
The system MUST allow users to apply stash entries non-destructively and pop stash entries destructively with explicit operation outcomes.

#### Scenario: Apply stash entry
- **WHEN** the user applies a selected stash entry
- **THEN** the system applies stash changes to worktree and keeps the stash entry in stash list

#### Scenario: Pop stash entry
- **WHEN** the user pops a selected stash entry
- **THEN** the system applies stash changes and removes that stash entry from stash list on success

### Requirement: Destructive stash actions MUST be policy-safe
The system MUST require explicit confirmation for destructive stash actions and MUST provide actionable guidance when stash operations fail.

#### Scenario: Confirm stash drop action
- **WHEN** the user requests dropping a stash entry
- **THEN** the system requires explicit confirmation before removing the stash entry

#### Scenario: Stash operation failure feedback
- **WHEN** stash apply/pop/drop fails
- **THEN** the system returns structured error details and no silent partial state change is reported as success
