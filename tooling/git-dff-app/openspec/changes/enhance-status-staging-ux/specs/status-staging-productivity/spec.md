## ADDED Requirements

### Requirement: Status panel MUST support interactive filtering and grouping
The system MUST provide fast filtering and grouping controls for staged, unstaged, and untracked lists so users can quickly narrow actionable files in large working trees.

#### Scenario: Filter files by text query
- **WHEN** a user enters a filter query in the status panel
- **THEN** the system shows only matching files across the active status section without mutating repository state

#### Scenario: Group files for scan efficiency
- **WHEN** a user selects a grouping mode supported by the status panel
- **THEN** the system presents files in grouped buckets while preserving each file's actionable status controls

### Requirement: Status panel MUST support multi-select and bulk actions
The system MUST allow users to select multiple files within a status section and execute bulk stage, unstage, or discard actions using existing policy-safe command semantics.

#### Scenario: Bulk stage selected unstaged files
- **WHEN** a user selects multiple unstaged files and invokes bulk stage
- **THEN** the system stages all selected files in one operation and refreshes panel state

#### Scenario: Bulk unstage selected staged files
- **WHEN** a user selects multiple staged files and invokes bulk unstage
- **THEN** the system unstages all selected files and refreshes panel state

#### Scenario: Bulk discard selected tracked files
- **WHEN** a user selects discard-eligible tracked files and confirms bulk discard
- **THEN** the system discards all selected tracked changes and refreshes panel state

### Requirement: Status panel MUST expose keyboard-first navigation and action shortcuts
The system MUST provide keyboard navigation and action shortcuts for list movement, selection toggling, and bulk execution to reduce mouse-dependent workflows.

#### Scenario: Navigate and select files via keyboard
- **WHEN** a user uses supported navigation keys in the status panel
- **THEN** focus and selection update predictably without losing current panel context

#### Scenario: Execute bulk action via keyboard shortcut
- **WHEN** a user triggers a valid bulk-action shortcut with selected files
- **THEN** the system executes the matching action and reports success or failure feedback

### Requirement: Status panel MUST remain responsive on large status sets
The system MUST keep status interactions responsive for large change sets through bounded rendering and section-level scrolling behavior.

#### Scenario: Large repository status render
- **WHEN** the status panel receives a large list of changed files
- **THEN** it renders an initial bounded subset quickly and provides explicit controls to expand additional entries

#### Scenario: Scroll within section without full-page jank
- **WHEN** a user scrolls a long status section
- **THEN** scrolling remains scoped to that section and does not degrade interaction in sibling panels
