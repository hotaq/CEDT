## Purpose

Define non-repository detection and explicit repository initialization flows when opening local folders.

## Requirements

### Requirement: Non-repository detection outcome MUST be explicit and machine-readable
The system MUST distinguish non-repository selection outcomes from generic repository-open failures and MUST return structured metadata that allows the client to render an initialization decision state.

#### Scenario: Detect non-repository folder
- **WHEN** the user attempts to open a folder that is not initialized as a Git repository
- **THEN** the system returns a structured outcome indicating initialization is available for that folder

#### Scenario: Preserve generic failure handling
- **WHEN** repository open fails for reasons other than non-repository status
- **THEN** the system returns a non-init failure classification with actionable error guidance

### Requirement: Repository initialization MUST require explicit user confirmation
The system MUST NOT initialize a repository unless the user has explicitly confirmed the initialization action for the selected folder.

#### Scenario: User confirms initialization
- **WHEN** the client submits an initialization request with explicit confirmation for the selected folder
- **THEN** the system proceeds to execute repository initialization for that folder

#### Scenario: User declines initialization
- **WHEN** the user declines the initialization prompt
- **THEN** the system performs no repository modifications and returns a non-fatal declined outcome

### Requirement: Initialization success MUST transition to an active session
After successful initialization, the system MUST return an active repository session using the same contract shape as repository-open success responses.

#### Scenario: Initialize and open session
- **WHEN** repository initialization succeeds for the selected folder
- **THEN** the system returns a valid active session payload bound to the initialized repository root

#### Scenario: Initialization fails
- **WHEN** `git init` fails due to filesystem, permission, or Git execution errors
- **THEN** the system returns a structured failure response and no active repository session is created
