# Test Suite 4: TipTap Rich Text Editor

[← Back to Index](./test-plan-index.md)

## Test 4.1: Editor Initialization

**Priority:** High
**Steps:**

1. Navigate to `/notes/new`
2. Observe the content editor area

**Expected Results:**

- [ ] Editor loads without errors
- [ ] No SSR hydration mismatch errors in console
- [ ] Formatting toolbar is visible above editor
- [ ] Editor has border and proper styling
- [ ] Editor has minimum height (~300px)
- [ ] Cursor is ready for input

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.2: Basic Text Input

**Priority:** High
**Steps:**

1. Click in the editor area
2. Type "This is a test note with some content."

**Expected Results:**

- [ ] Text appears in editor
- [ ] Cursor position updates correctly
- [ ] No lag or performance issues
- [ ] Text wraps at editor boundary

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.3: Bold Formatting

**Priority:** High
**Steps:**

1. Type "normal text"
2. Click Bold button (B)
3. Type "bold text"
4. Click Bold button again
5. Type "more normal text"

**Expected Results:**

- [ ] Bold button shows active state when clicked
- [ ] Text typed after clicking B is bold
- [ ] Bold formatting stops after clicking B again
- [ ] Button returns to inactive state

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.4: Italic Formatting

**Priority:** High
**Steps:**

1. Type "normal text"
2. Click Italic button (I)
3. Type "italic text"
4. Click Italic button again

**Expected Results:**

- [ ] Italic button shows active state
- [ ] Text is italicized correctly
- [ ] Can toggle italic on/off

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.5: Inline Code Formatting

**Priority:** Medium
**Steps:**

1. Type "Use the"
2. Click Code button (<>)
3. Type "console.log()"
4. Click Code button again
5. Type "method"

**Expected Results:**

- [ ] Code button shows active state
- [ ] Text appears in monospace font
- [ ] Code styling is visually distinct
- [ ] Can toggle code formatting

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.6: Heading 1 (H1)

**Priority:** High
**Steps:**

1. Click H1 button
2. Type "Main Heading"
3. Press Enter
4. Type normal text

**Expected Results:**

- [ ] H1 button shows active state
- [ ] Text is large and bold (H1 styling)
- [ ] Pressing Enter creates new paragraph
- [ ] New paragraph returns to normal text

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.7: Heading 2 (H2)

**Priority:** Medium
**Steps:**

1. Click H2 button
2. Type "Section Heading"

**Expected Results:**

- [ ] H2 button shows active state
- [ ] Text appears with H2 styling (smaller than H1)
- [ ] Styling is visually distinct

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.8: Heading 3 (H3)

**Priority:** Medium
**Steps:**

1. Click H3 button
2. Type "Subsection Heading"

**Expected Results:**

- [ ] H3 button shows active state
- [ ] Text appears with H3 styling (smaller than H2)

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.9: Bullet List

**Priority:** High
**Steps:**

1. Click Bullet List button (•)
2. Type "First item"
3. Press Enter
4. Type "Second item"
5. Press Enter
6. Type "Third item"

**Expected Results:**

- [ ] Bullet List button shows active state
- [ ] Each line has a bullet point
- [ ] Pressing Enter creates new list item
- [ ] Proper indentation and spacing

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.10: Numbered List

**Priority:** High
**Steps:**

1. Click Numbered List button (1.)
2. Type "First step"
3. Press Enter
4. Type "Second step"
5. Press Enter
6. Type "Third step"

**Expected Results:**

- [ ] Numbered List button shows active state
- [ ] Numbers appear automatically (1, 2, 3)
- [ ] Pressing Enter creates new numbered item
- [ ] Numbers increment correctly

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.11: Code Block

**Priority:** Medium
**Steps:**

1. Click Code Block button ({ })
2. Type multiple lines of code:
   ```typescript
   function hello() {
     return 'world';
   }
   ```

**Expected Results:**

- [ ] Code Block button shows active state
- [ ] Code appears in monospace font
- [ ] Background is distinct from normal text
- [ ] Multi-line code is properly formatted
- [ ] Indentation is preserved

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.12: Blockquote

**Priority:** Medium
**Steps:**

1. Click Blockquote button (")
2. Type "This is a quoted text"

**Expected Results:**

- [ ] Blockquote button shows active state
- [ ] Text has left border/indentation
- [ ] Styling differentiates it from normal text

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.13: Horizontal Rule

**Priority:** Low
**Steps:**

1. Type some text
2. Press Enter
3. Click Horizontal Rule button (—)
4. Type more text

**Expected Results:**

- [ ] Horizontal line is inserted
- [ ] Line spans full editor width
- [ ] Can continue typing after the line

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:

---

## Test 4.14: Combined Formatting

**Priority:** High
**Steps:**

1. Create a note with:
   - H1: "My Note"
   - Normal paragraph
   - Bold + Italic text combined
   - Bullet list with 3 items
   - Code block
   - Blockquote

**Expected Results:**

- [ ] All formatting types work together
- [ ] Can combine bold + italic on same text
- [ ] Switching between formats works smoothly
- [ ] Visual hierarchy is clear

**Actual Results:**

- Status: ⬜ Pass / ⬜ Fail / ⬜ Blocked
- Notes:
