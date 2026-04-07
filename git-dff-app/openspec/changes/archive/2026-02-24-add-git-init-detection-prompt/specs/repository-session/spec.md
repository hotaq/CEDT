## MODIFIED Requirements

### Requirement: Repository workspace MUST be validated before session creation
The system MUST validate that a selected directory resolves to a Git repository root before creating an active repository session, and MUST provide an explicit initialization-eligible outcome when the selected directory is not yet a Git repository.

#### Scenario: Open valid repository
- **WHEN** a user selects a directory that is part of a valid Git repository
- **THEN** the system creates an active repository session bound to the resolved repository root

#### Scenario: Detect initialization-eligible folder
- **WHEN** a user selects a directory that is not part of a valid Git repository
- **THEN** the system returns a structured non-repository outcome indicating the folder can be initialized

#### Scenario: Create session after accepted initialization
- **WHEN** the user confirms initialization and repository initialization succeeds
- **THEN** the system creates an active repository session bound to the initialized repository root

#### Scenario: Preserve explicit decline outcome
- **WHEN** the user declines repository initialization
- **THEN** the system returns a declined outcome and does not create an active repository session
