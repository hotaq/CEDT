## ADDED Requirements

### Requirement: Working tree status MUST be exposed as structured data
The system MUST provide structured status data that distinguishes staged, unstaged, and untracked changes for the active repository session.

#### Scenario: Return segmented status
- **WHEN** the client requests repository status
- **THEN** the system returns staged, unstaged, and untracked change sets in a machine-readable structure

### Requirement: Staging operations MUST support explicit file selection
The system MUST allow clients to stage and unstage explicitly selected paths within the active repository.

#### Scenario: Stage selected paths
- **WHEN** the client requests staging for one or more valid repository paths
- **THEN** the system marks those paths as staged

#### Scenario: Unstage selected paths
- **WHEN** the client requests unstaging for one or more currently staged paths
- **THEN** the system marks those paths as unstaged

### Requirement: Discard actions MUST be constrained and explicit
The system MUST only allow discard/revert actions for supported path categories and MUST return clear errors for unsupported discard targets.

#### Scenario: Discard tracked path changes
- **WHEN** the client confirms discard for tracked file changes
- **THEN** the system restores those tracked changes from repository state

#### Scenario: Reject unsupported discard target
- **WHEN** the client requests discard for a path category not supported by the current policy
- **THEN** the system rejects the request with a clear error and makes no repository changes
