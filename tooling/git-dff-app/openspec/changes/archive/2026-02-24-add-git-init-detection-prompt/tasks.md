## 1. Backend Detection and Init Commands

- [x] 1.1 Update `open_repo` to return an explicit non-repository detection outcome that frontend can branch on without parsing message text.
- [x] 1.2 Add an allowlisted `init_repo` backend command that requires explicit confirmation and runs `git init` only for validated target paths.
- [x] 1.3 Return session payload in the same shape as `open_repo` success when initialization succeeds.

## 2. Frontend Open-Repository Flow

- [x] 2.1 Add open-repository UI state for initialization-eligible folders (`Initialize` / `Cancel` decision).
- [x] 2.2 Wire `Initialize` action to backend `init_repo` and transition to normal session view on success.
- [x] 2.3 Preserve clear declined/failure messaging and keep existing behavior for valid repositories and other open failures.

## 3. Safety and Error Handling

- [x] 3.1 Enforce canonical path validation and repository-boundary checks for initialization requests.
- [x] 3.2 Classify init-path failures with existing structured error categories (`validation`, `policy`, `git`, `internal`) and actionable guidance.

## 4. Verification and Regression Coverage

- [x] 4.1 Add backend tests for non-repo detection, confirmed init success, declined init, and init failure.
- [x] 4.2 Add integration flow tests covering open non-repo -> prompt -> init -> session creation and no-op on decline.
- [x] 4.3 Run build and test suites to confirm no regressions in existing repository-open, status, and commit flows.
