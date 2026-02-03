# Test Suite 7: Authentication & Security

[← Back to Index](./test-plan-index.md)

## Test 7.1: Unauthenticated Access - Dashboard

**Priority:** Critical
**Steps:**

1. Log out of application
2. Manually navigate to `/dashboard`

**Expected Results:**

- [ ] Redirects to `/authenticate`
- [ ] Cannot access dashboard without login
- [ ] No data exposure

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 7.2: Unauthenticated Access - New Note

**Priority:** Critical
**Steps:**

1. Log out of application
2. Manually navigate to `/notes/new`

**Expected Results:**

- [ ] Redirects to `/authenticate`
- [ ] Cannot access form without login

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 7.3: Session Expiration

**Priority:** High
**Steps:**

1. Log in
2. Wait for session to expire (or manually delete session)
3. Try to create a note

**Expected Results:**

- [ ] Redirected to login page
- [ ] Error handled gracefully
- [ ] No data loss (could store draft locally - future feature)

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
