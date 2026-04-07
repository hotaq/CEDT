## ADDED Requirements

### Requirement: Evaluate Category Budget Velocity
The system SHALL compute the projected spend-to-date for each category with a configured budget limit and determine whether the user is on track to exceed that limit before the end of the month.

#### Scenario: Spending velocity within budget
- **WHEN** the alert engine evaluates a category and the projected month-end spend is at or below the configured limit
- **THEN** no alert is generated for that category

#### Scenario: Spending velocity exceeds budget threshold
- **WHEN** the alert engine evaluates a category and the projected month-end spend is greater than the configured limit
- **THEN** the system marks that category as "at risk" and queues a push notification for the user

### Requirement: Deliver Push Notification Alert
The system SHALL send a push notification to the user's registered device when a budget category is projected to be exhausted before the end of the month, including a contextual message and the estimated exhaustion date.

#### Scenario: Successful push notification delivery
- **WHEN** a category is marked "at risk" and the user has a registered push subscription
- **THEN** the system sends a push notification with a message in the format: "At this rate, you'll be out of '{Category}' budget by {Day}."
- **AND** the notification is delivered within 60 seconds of the alert evaluation

#### Scenario: Push notification when subscription is missing
- **WHEN** a category is marked "at risk" but the user has no registered push subscription
- **THEN** the system skips push delivery and logs the skipped alert server-side

### Requirement: Store and Manage Push Subscriptions
The system SHALL persist Web Push subscription objects (endpoint, p256dh, auth) per user so that push notifications can be delivered across sessions.

#### Scenario: Registering a new push subscription
- **WHEN** the user grants push notification permission in the browser
- **THEN** the system registers the subscription via the Web Push API and persists it to the `push_subscriptions` table

#### Scenario: Replacing an existing subscription
- **WHEN** the user's browser generates a new push subscription (e.g., after clearing site data)
- **THEN** the system replaces the previous subscription record for that user with the new one

### Requirement: Manage Category Budget Limits
The system SHALL allow per-category monthly budget limits to be stored and retrieved so the alert engine can evaluate velocity against them.

#### Scenario: Retrieving budget limits for evaluation
- **WHEN** the alert engine runs an evaluation cycle
- **THEN** it fetches all active budget limits for the current user from the `budget_limits` table
- **AND** evaluates velocity only for categories that have a configured limit
