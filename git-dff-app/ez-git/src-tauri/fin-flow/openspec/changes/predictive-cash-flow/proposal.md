## Why

Users can see what they've spent, but have no way to anticipate where they're headed. This feature adds forward-looking intelligence to fin-flow: a spending forecast chart that projects the month-end balance based on average daily burn rate, plus proactive push notifications that warn users before they blow a category budget.

## What Changes

- Add a **Spending Forecast Chart** (line chart) to the dashboard showing historical spend alongside a projected trend line through month-end
- Add a **Budget Alert Engine** that evaluates spending velocity per category daily and fires push notifications when a user is on track to exhaust a category budget before the month ends (e.g., "At this rate, you'll be out of 'Eating Out' budget by Friday.")
- New backend endpoint to compute spending forecasts and evaluate alert conditions
- New frontend notification permission + push notification integration

## Capabilities

### New Capabilities

- `spending-forecast`: Line chart that plots actual daily spending alongside a linear projection to month-end balance, computed from average daily burn rate
- `budget-alert-engine`: Server-side evaluation of per-category spending velocity; triggers push notifications to a user's device when projected overage is detected within the current month

### Modified Capabilities

- `expense-dashboard`: New requirement to render the `spending-forecast` chart component within the dashboard view

## Impact

- **Frontend**: New chart component (e.g., recharts / chart.js), push notification subscription logic (Web Push API)
- **Backend**: New `/api/forecast` GET endpoint; new `/api/alerts/evaluate` scheduled job or trigger; push notification delivery (web-push library or similar)
- **Database**: May require a `push_subscriptions` table and `budget_limits` table for storing per-category thresholds
- **Dependencies**: Push notification service (VAPID keys), charting library
