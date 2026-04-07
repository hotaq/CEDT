## MODIFIED Requirements

### Requirement: Working tree status MUST be exposed as structured data
The system MUST provide structured status data that distinguishes staged, unstaged, and untracked changes for the active repository session, and MUST expose metadata needed for filtering, grouping, and efficient section-local rendering in the status panel.

#### Scenario: Return segmented status
- **WHEN** the client requests repository status
- **THEN** the system returns staged, unstaged, and untracked change sets in a machine-readable structure

#### Scenario: Return status metadata for productivity controls
- **WHEN** the client receives status data for rendering
- **THEN** each returned entry includes stable identifiers and display fields that support filter/group operations and selection state mapping

### Requirement: Staging operations MUST support explicit file selection
The system MUST allow clients to stage and unstage explicitly selected paths within the active repository, including multi-path requests for bulk interaction flows.

#### Scenario: Stage selected paths
- **WHEN** the client requests staging for one or more valid repository paths
- **THEN** the system marks those paths as staged

#### Scenario: Unstage selected paths
- **WHEN** the client requests unstaging for one or more currently staged paths
- **THEN** the system marks those paths as unstaged

#### Scenario: Bulk stage selected paths
- **WHEN** the client submits a multi-path stage request from a bulk action
- **THEN** the system stages all valid selected paths and returns updated status state

#### Scenario: Bulk unstage selected paths
- **WHEN** the client submits a multi-path unstage request from a bulk action
- **THEN** the system unstages all valid selected paths and returns updated status state

### Requirement: Discard actions MUST be constrained and explicit
The system MUST only allow discard/revert actions for supported path categories and MUST return clear errors for unsupported discard targets, including bulk discard requests that contain unsupported selections.

#### Scenario: Discard tracked path changes
- **WHEN** the client confirms discard for tracked file changes
- **THEN** the system restores those tracked changes from repository state

#### Scenario: Reject unsupported discard target
- **WHEN** the client requests discard for a path category not supported by the current policy
- **THEN** the system rejects the request with a clear error and makes no repository changes

#### Scenario: Reject mixed bulk discard with unsupported targets
- **WHEN** a bulk discard request contains one or more unsupported path categories
- **THEN** the system rejects the operation with policy guidance and does not perform partial discard side effects
