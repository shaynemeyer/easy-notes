# Test Suite 8: UI/UX & Accessibility

[← Back to Index](./test-plan-index.md)

## Test 8.1: Dark Mode

**Priority:** High
**Steps:**

1. Switch system theme to dark mode
2. Navigate through all pages
3. Create a note

**Expected Results:**

- [ ] Header uses dark background
- [ ] Text is readable (light on dark)
- [ ] Editor has dark styling
- [ ] Toolbar buttons have dark theme
- [ ] Form inputs have dark background
- [ ] No white flashes or theme inconsistencies

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 8.2: Light Mode

**Priority:** High
**Steps:**

1. Switch system theme to light mode
2. Navigate through all pages
3. Create a note

**Expected Results:**

- [ ] Header uses light background
- [ ] Text is readable (dark on light)
- [ ] Editor has light styling
- [ ] All colors have sufficient contrast

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 8.3: Keyboard Navigation

**Priority:** Medium
**Steps:**

1. Navigate to `/notes/new`
2. Use Tab key to navigate through form
3. Use keyboard shortcuts in editor (Ctrl+B, Ctrl+I, etc.)

**Expected Results:**

- [ ] Can tab to title input
- [ ] Can tab to editor
- [ ] Can tab to toolbar buttons
- [ ] Can tab to submit button
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work (if implemented)

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 8.4: Screen Reader Compatibility

**Priority:** Medium
**Steps:**

1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to new note page
3. Fill out form using screen reader

**Expected Results:**

- [ ] Labels are announced correctly
- [ ] Buttons have accessible names
- [ ] Form fields are properly labeled
- [ ] Error messages are announced
- [ ] Editor content is accessible

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 8.5: Responsive Design - Mobile

**Priority:** Medium
**Steps:**

1. Open app in mobile viewport (375px width)
2. Navigate to dashboard
3. Click "New Note"
4. Create a note

**Expected Results:**

- [ ] Header is responsive (stacks properly)
- [ ] New Note button is accessible
- [ ] Form fields are full width
- [ ] Toolbar buttons wrap or scroll horizontally
- [ ] Editor is usable on mobile
- [ ] No horizontal scrolling

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 8.6: Responsive Design - Tablet

**Priority:** Low
**Steps:**

1. Open app in tablet viewport (768px width)
2. Test all functionality

**Expected Results:**

- [ ] Layout adapts to tablet size
- [ ] All features remain accessible
- [ ] Proper spacing and sizing

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
