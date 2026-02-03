# Test Suite 5: Form Submission

[← Back to Index](./test-plan-index.md)

## Test 5.1: Submit Valid Note

**Priority:** Critical
**Steps:**

1. Navigate to `/notes/new`
2. Enter title: "Test Note Title"
3. Enter content: "This is my test note with **bold** text."
4. Click "Create Note" button

**Expected Results:**

- [ ] Button shows "Loading..." during submission
- [ ] Button is disabled during submission
- [ ] No console errors
- [ ] Redirects to `/notes/[id]` (note view page)
- [ ] Note is created in database
- [ ] Success indicated (redirect to note page)

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 5.2: Submit Empty Title

**Priority:** High
**Steps:**

1. Navigate to `/notes/new`
2. Clear title field (make it empty)
3. Enter some content in editor
4. Click "Create Note" button

**Expected Results:**

- [ ] Error message appears: "Title is required"
- [ ] Form does not submit
- [ ] No redirect occurs
- [ ] Error is displayed in red banner/text
- [ ] Can correct and re-submit

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 5.3: Submit Title Exceeding 200 Characters

**Priority:** Medium
**Steps:**

1. Navigate to `/notes/new`
2. Enter title with 250 characters
3. Add content
4. Click "Create Note" button

**Expected Results:**

- [ ] Error message: "Title must be 200 characters or less"
- [ ] Form does not submit
- [ ] Error is clearly displayed

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 5.4: Submit Empty Content

**Priority:** Medium
**Steps:**

1. Navigate to `/notes/new`
2. Enter title: "Empty Note"
3. Leave editor empty (default empty paragraph)
4. Click "Create Note" button

**Expected Results:**

- [ ] Note is created successfully
- [ ] Empty content is valid (default TipTap doc)
- [ ] Redirects to note page
- [ ] Note exists in database

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 5.5: Multiple Rapid Submissions

**Priority:** Medium
**Steps:**

1. Fill out note form
2. Click "Create Note" button multiple times rapidly

**Expected Results:**

- [ ] Button is disabled after first click
- [ ] Only one note is created
- [ ] No duplicate submissions
- [ ] No race conditions or errors

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
