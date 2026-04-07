## ADDED Requirements

### Requirement: Repository workspace MUST be validated before session creation
The system MUST validate that a selected directory resolves to a Git repository root before creating an active repository session.

#### Scenario: Open valid repository
- **WHEN** a user selects a directory that is part of a valid Git repository
- **THEN** the system creates an active repository session bound to the resolved repository root

#### Scenario: Reject non-repository path
- **WHEN** a user selects a directory that is not part of a valid Git repository
- **THEN** the system rejects session creation and returns a user-visible validation error

### Requirement: Session-scoped operations MUST enforce repository boundary
The system MUST bind all repository operations to the active session repository root and MUST reject requests that attempt to address paths outside that root.

#### Scenario: Accept repository-relative path
- **WHEN** a client requests an operation for a path within the active repository root
- **THEN** the system accepts the request for processing

#### Scenario: Reject path traversal
- **WHEN** a client sends a path that resolves outside the active repository root
- **THEN** the system rejects the request and no Git operation is executed
