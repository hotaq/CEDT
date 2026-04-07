## Context

fin-flow already captures and parses receipts via the OCR extraction engine and displays them in the expense dashboard. Users currently have full visibility into past transactions but no forward-looking insight. This design addresses that gap with two components: a client-side forecast chart and a server-side budget alert engine. The stack is React (frontend) + Node.js/Express (backend).

## Goals / Non-Goals

**Goals:**
- Compute a day-by-day spending projection to month-end using a simple linear model (average daily spend × remaining days)
- Render the forecast as a line chart on the expense dashboard (historical actuals + projected line)
- Evaluate per-category budget thresholds server-side and fire push notifications when projected overage is detected
- Store per-user VAPID push subscriptions and budget limits in the database

**Non-Goals:**
- Machine learning or non-linear forecasting models (linear is sufficient for v1)
- Email or SMS alerts (push notifications only)
- Multi-user households or shared budgets
- Historical alert log / notification history UI

## Decisions

### 1. Charting Library: Recharts
**Decision:** Use `recharts` (React-native composable charts).
**Rationale:** Recharts has zero additional non-React deps, integrates cleanly with React state, and handles mixed `actual` + `projected` series on the same axis trivially via a `<ComposedChart>`. Alternatives: Chart.js requires a Canvas ref and is heavier; Victory is verbose for mixed series.

### 2. Forecast Algorithm: Linear Daily Burn Rate
**Decision:** `projectedBalance = currentBalance - (avgDailySpend × daysRemaining)`
where `avgDailySpend = totalSpentThisMonth / dayOfMonth`.
**Rationale:** Simple, interpretable, and computable from existing transaction data without any new ML infrastructure. The inaccuracy is acceptable for a "heads-up" UX. Revisit with weighted moving average in v2 if needed.

### 3. Push Notification Delivery: Web Push (VAPID) via `web-push` npm package
**Decision:** Use the W3C Web Push Protocol with VAPID keys managed server-side. Frontend subscribes via `navigator.serviceWorker` + `PushManager.subscribe()`. Backend sends via `webpush.sendNotification()`.
**Rationale:** Works cross-browser (Chrome, Firefox, Edge, Safari 16.4+) without a third-party push service. Keeps user data in-house. Alternative (FCM direct) would require Google account coupling.

### 4. Alert Evaluation Trigger: On-Demand at Dashboard Load (v1), Scheduled Job (v2)
**Decision (v1):** Evaluate alert conditions when the user opens the dashboard (server checks and delivers if overdue). No cron required for MVP.
**Rationale:** Avoids ops complexity of a cron/worker for v1. Downside: alert is not delivered if user doesn't open the app — acceptable for MVP. A scheduled job (node-cron or Supabase pg_cron) is the v2 migration path.

### 5. New Database Tables
- `budget_limits (id, user_id, category, monthly_limit_thb, created_at)` — stores user-defined category thresholds
- `push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)` — stores Web Push subscription objects

**Rationale:** Keeps budget config close to transaction data. Push subscriptions need persisting across sessions.

## Risks / Trade-offs

- **Push permission UX** → Users may deny push permission. Mitigation: show an in-app fallback warning banner in the dashboard if push is denied or not supported.
- **Linear model inaccuracy** → Forecast overstates overage for users with lumpy spend (e.g., paid rent on day 1). Mitigation: add a disclaimer label "estimated" on the chart; v2 can smooth with a 7-day rolling average.
- **Service Worker complexity** → SW registration adds testing surface. Mitigation: isolate SW to `sw.js`; test push independently with `web-push` CLI tool.
- **VAPID key management** → Keys must be generated once and stored as env vars. Loss = all subscriptions invalidate. Mitigation: document key generation in README; store in `.env` and CI secrets.

## Migration Plan

1. Generate VAPID keys once: `npx web-push generate-vapid-keys` → add to `.env`
2. Run DB migration to add `budget_limits` and `push_subscriptions` tables
3. Deploy backend with new `/api/forecast` and `/api/alerts/evaluate` routes
4. Deploy frontend with `sw.js`, updated dashboard, and notification permission flow
5. Rollback: remove new routes and feature-flag the chart component — no destructive DB changes

## Open Questions

- Should `budget_limits` be seeded with sensible defaults (e.g., 3000 THB/month for "Eating Out") or require explicit user setup first?
- Do we want an in-app UI to set/edit budget limits, or hard-code them for the MVP?
