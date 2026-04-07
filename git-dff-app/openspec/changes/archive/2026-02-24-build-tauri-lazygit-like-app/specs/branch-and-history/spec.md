## ADDED Requirements

### Requirement: Branch listing MUST include active branch context
The system MUST provide a branch list that identifies the currently checked-out branch for the active repository session.

#### Scenario: Return branches with active marker
- **WHEN** the client requests branch data
- **THEN** the system returns available branches and marks the active branch

### Requirement: Commit history MUST be queryable with stable fields
The system MUST provide recent commit history with stable fields sufficient for list and detail views.

#### Scenario: Return recent history entries
- **WHEN** the client requests recent commit history
- **THEN** the system returns a bounded list of commit entries with consistent metadata fields

### Requirement: Branch checkout MUST enforce safety preconditions
The system MUST enforce policy checks before switching branches and MUST fail safely when preconditions are not met.

#### Scenario: Checkout allowed branch
- **WHEN** the client requests checkout to a valid branch and safety preconditions pass
- **THEN** the system switches the active branch and returns success

#### Scenario: Block unsafe checkout
- **WHEN** checkout preconditions fail based on uncommitted-state policy
- **THEN** the system blocks checkout and returns a clear policy error
