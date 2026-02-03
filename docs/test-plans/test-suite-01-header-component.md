# Test Suite 1: Header Component

[← Back to Index](./test-plan-index.md)

## Test 1.1: Header Visibility

**Priority:** High
**Steps:**

1. Log in to the application
2. Navigate to `/dashboard`

**Expected Results:**

- [ ] Header is visible at the top of the page
- [ ] "EasyNotes" branding is displayed on the left
- [ ] Logout button is visible on the right
- [ ] Header has proper border and background color
- [ ] Dark mode: Header background is dark, text is light

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 1.2: EasyNotes Logo Link

**Priority:** High
**Steps:**

1. From any authenticated page
2. Click "EasyNotes" text in header

**Expected Results:**

- [ ] Navigates to `/dashboard`
- [ ] No page reload (client-side navigation)
- [ ] Hover effect shows (color change to blue)

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 1.3: Logout Functionality

**Priority:** High
**Steps:**

1. From dashboard or any authenticated page
2. Click "Logout" button in header
3. Observe button state and redirect

**Expected Results:**

- [ ] Button shows "Logging out..." during logout
- [ ] Button is disabled during logout
- [ ] Successfully redirects to `/authenticate`
- [ ] Session is cleared (cannot access `/dashboard` without re-login)
- [ ] No console errors

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 1.4: Header Persistence

**Priority:** Medium
**Steps:**

1. Navigate to `/dashboard`
2. Navigate to `/notes/new`
3. Navigate to `/notes/[id]`

**Expected Results:**

- [ ] Header appears on all authenticated pages
- [ ] Header styling is consistent across pages
- [ ] Logout button works from any page

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
