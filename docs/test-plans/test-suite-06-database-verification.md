# Test Suite 6: Database Verification

[← Back to Index](./test-plan-index.md)

## Test 6.1: Verify Note in Database

**Priority:** High
**Steps:**

1. Create a note with title "Database Test"
2. Run database query (see [Utilities](./test-plan-utilities.md#check-all-notes))

**Expected Results:**

- [ ] Note exists in database
- [ ] `id` is a valid nanoid string
- [ ] `user_id` matches logged-in user
- [ ] `title` is "Database Test"
- [ ] `content_json` is valid TipTap JSON
- [ ] `is_public` is 0 (false)
- [ ] `public_slug` is null
- [ ] `created_at` and `updated_at` are ISO timestamps

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 6.2: Verify TipTap JSON Structure

**Priority:** High
**Steps:**

1. Create note with formatted content
2. Query database and parse `content_json`
3. Verify JSON structure

**Expected Results:**

- [ ] JSON has `type: "doc"`
- [ ] JSON has `content` array
- [ ] Each content item has proper `type` field
- [ ] Formatted text has correct marks (bold, italic, etc.)
- [ ] JSON is valid and parseable

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 6.3: Verify User Ownership

**Priority:** Critical
**Steps:**

1. Log in as User A
2. Create a note
3. Log in as User B
4. Try to access User A's note via `/notes/[id]`

**Expected Results:**

- [ ] User B cannot access User A's note
- [ ] 404 or redirect to dashboard
- [ ] Database query filters by `user_id`
- [ ] No cross-user data access

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
