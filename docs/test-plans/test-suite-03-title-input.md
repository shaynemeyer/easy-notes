# Test Suite 3: New Note Page - Title Input

[← Back to Index](./test-plan-index.md)

## Test 3.1: Default Title Value

**Priority:** Medium
**Steps:**

1. Navigate to `/notes/new`
2. Observe title input field

**Expected Results:**

- [ ] Title input has default value "Untitled note"
- [ ] Input is focused and ready for editing
- [ ] Label "Title" is visible above input

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 3.2: Title Input Editing

**Priority:** High
**Steps:**

1. Navigate to `/notes/new`
2. Clear title field
3. Type "My First Note"
4. Type 250 characters (exceeds 200 limit)

**Expected Results:**

- [ ] Can clear and type in title field
- [ ] Characters appear as typed
- [ ] No immediate validation errors while typing
- [ ] 250 character input is allowed (validation on submit)

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
