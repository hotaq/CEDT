## MODIFIED Requirements

### Requirement: Destructive operations MUST require explicit confirmation
The system MUST require explicit confirmation before executing operations that can discard user work, including destructive stash actions.

#### Scenario: Confirm destructive operation
- **WHEN** the client requests a destructive operation
- **THEN** the system requires explicit confirmation before execution

#### Scenario: Cancel destructive operation
- **WHEN** explicit confirmation is not provided
- **THEN** the system does not execute the operation

### Requirement: Unsafe operation classes MUST be denied by default
The system MUST deny operation classes outside the supported safety policy scope.

#### Scenario: Reject denied operation class
- **WHEN** the client requests an operation class marked unsafe by policy
- **THEN** the system rejects the request and returns a policy denial error

### Requirement: Error surfaces MUST be user-actionable
The system MUST classify and return operational errors with messages that allow users to take corrective action across local, remote, and stash operations.

#### Scenario: Return actionable failure detail
- **WHEN** any Git operation fails
- **THEN** the system returns a structured error containing failure category and actionable guidance text

#### Scenario: Remote operation failure guidance
- **WHEN** fetch, pull, or push fails
- **THEN** the system returns structured error detail that includes guidance for retry/reconcile actions

### Requirement: Backend command surface MUST be allowlisted
The system MUST expose only allowlisted repository operations and MUST not provide a generic command execution endpoint.

#### Scenario: Reject non-allowlisted command request
- **WHEN** a client attempts to invoke an operation not present in the allowlist
- **THEN** the system rejects the request and performs no repository changes
