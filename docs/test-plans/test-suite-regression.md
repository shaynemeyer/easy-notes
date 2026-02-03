# Regression Tests

[← Back to Index](./test-plan-index.md)

These tests verify that existing functionality still works after the new feature implementation.

## Regression 1: Login Still Works

**Priority:** Critical
**Steps:**

1. Log out
2. Navigate to `/authenticate`
3. Log in with test credentials

**Expected Results:**

- [ ] Login form works
- [ ] Redirects to dashboard after login
- [ ] Session is created

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Regression 2: Register Still Works

**Priority:** Critical
**Steps:**

1. Navigate to registration page
2. Create new account

**Expected Results:**

- [ ] Registration completes successfully
- [ ] Can log in with new account
- [ ] No errors

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
