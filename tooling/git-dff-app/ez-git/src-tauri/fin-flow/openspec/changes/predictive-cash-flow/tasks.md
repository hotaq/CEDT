## 1. Database Setup

- [ ] 1.1 Create migration to add `budget_limits` table (`id`, `user_id`, `category`, `monthly_limit_thb`, `created_at`)
- [ ] 1.2 Create migration to add `push_subscriptions` table (`id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`)
- [ ] 1.3 Seed default budget limits for common categories (e.g., "Eating Out": 3000 THB, "Transport": 1500 THB)

## 2. Backend — Forecast API

- [ ] 2.1 Install `recharts` in the frontend package.json
- [ ] 2.2 Install `web-push` in the backend package.json
- [ ] 2.3 Generate VAPID key pair (`npx web-push generate-vapid-keys`) and store in `.env` as `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`
- [ ] 2.4 Implement `GET /api/forecast` route: query confirmed transactions for the current month, compute `avgDailySpend = totalSpent / dayOfMonth`, return daily actuals array + projected values through month-end
- [ ] 2.5 Write unit test for forecast computation (correct projection on day 1, day 15, last day of month)

## 3. Backend — Budget Alert Engine

- [ ] 3.1 Implement `GET /api/budget-limits` route: return all budget limits for the authenticated user
- [ ] 3.2 Implement `POST /api/budget-limits` route: upsert a budget limit for a given category
- [ ] 3.3 Implement alert evaluation logic: for each category with a limit, compute projected month-end spend; mark as "at risk" if projection exceeds limit
- [ ] 3.4 Implement `POST /api/push/subscribe` route: save or replace the user's Web Push subscription object in `push_subscriptions`
- [ ] 3.5 Implement `POST /api/alerts/evaluate` route: run evaluation, send push notifications for at-risk categories using `webpush.sendNotification()`, format message as "At this rate, you'll be out of '{Category}' budget by {Day}."
- [ ] 3.6 Call `/api/alerts/evaluate` as a side-effect when the dashboard data endpoint is requested (v1 on-demand trigger)

## 4. Frontend — Forecast Chart

- [ ] 4.1 Create `ForecastChart.jsx` component using `recharts` `<ComposedChart>`: solid `<Line>` for actuals, dashed `<Line>` for projection
- [ ] 4.2 Fetch `/api/forecast` on dashboard mount and feed data into `ForecastChart`
- [ ] 4.3 Display month-end projected balance summary: green if positive, red with "Projected overspend" label if negative
- [ ] 4.4 Handle empty-state: hide chart and show "Not enough data for forecast" when no current-month transactions exist
- [ ] 4.5 Add chart to `DashboardPage` below the transaction list

## 5. Frontend — Push Notification Integration

- [ ] 5.1 Create `sw.js` service worker in `public/` with a `push` event handler that calls `self.registration.showNotification()`
- [ ] 5.2 Register service worker in `App.jsx` on mount
- [ ] 5.3 Implement `requestPushPermission()` utility: call `PushManager.subscribe()` with `VAPID_PUBLIC_KEY`, POST subscription to `/api/push/subscribe`
- [ ] 5.4 Trigger push permission request on first dashboard visit if not yet granted
- [ ] 5.5 Show in-app fallback warning banner ("Enable notifications to receive budget alerts") if push permission is denied or unsupported
