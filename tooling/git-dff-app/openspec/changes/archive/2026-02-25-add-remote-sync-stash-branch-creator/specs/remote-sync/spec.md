## ADDED Requirements

### Requirement: Remote sync operations MUST expose explicit fetch, pull, and push actions
The system MUST provide distinct remote sync actions for fetch, pull, and push, and each action MUST return operation-specific success or failure results.

#### Scenario: Fetch remote updates
- **WHEN** the user runs fetch from the remote sync UI
- **THEN** the system executes fetch for the active repository and returns the result without mutating local worktree state

#### Scenario: Pull tracked branch updates
- **WHEN** the user runs pull for the active branch with an upstream
- **THEN** the system executes pull and returns success or a structured error describing why pull failed

#### Scenario: Push local commits
- **WHEN** the user runs push for the active branch with an upstream
- **THEN** the system executes push and returns success or a structured error describing why push failed

### Requirement: Remote sync status MUST be visible and actionable
The system MUST present sync-related status cues and operation outcomes so users can decide whether to fetch, pull, or push next.

#### Scenario: Show operation outcome feedback
- **WHEN** a remote sync action completes
- **THEN** the UI displays operation outcome feedback with actionable guidance for failures

#### Scenario: Refresh branch/history context after sync actions
- **WHEN** a remote sync action succeeds
- **THEN** the system refreshes relevant branch and history state to keep UI data consistent with repository state
