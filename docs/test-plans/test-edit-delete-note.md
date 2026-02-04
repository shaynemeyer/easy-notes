# Testing Guide

Prerequisites

1. Navigate to http://localhost:3000
2. Log in to your account
3. Go to the dashboard and select an existing note (or create one first)

Test 1: Edit Feature

1. Navigate to a note - Click on any note from the dashboard
2. Verify Edit button - You should see an "Edit" button (secondary variant - bordered, not
   filled)
3. Click Edit - Should navigate to /notes/[id]/edit
4. Verify Edit page:
   - Title should say "Edit Note"
   - "Back to Note" link at the top
   - Title input field pre-filled with current title
   - TipTap editor pre-filled with current content (should be editable)
   - "Save Changes" and "Cancel" buttons at the bottom

5. Make changes:
   - Modify the title (try different lengths)
   - Edit the content using TipTap (add/remove text, formatting)
   - Click "Save Changes"

6. Verify results:
   - Should redirect back to the note view page
   - Title should show updated text
   - Content should show your changes
   - "Updated" timestamp should be more recent

Test 2: Delete Feature

1. Navigate to a note - Click on any note from the dashboard
2. Verify Delete button - You should see a red "Delete" button
3. Click Delete - A modal dialog should appear with:
   - Title: "Delete Note"
   - Message: 'Are you sure you want to delete "[note title]"? This action cannot be undone.'
   - Two buttons: "Cancel" and "Delete" (red)

4. Test Cancel:
   - Click "Cancel" - Dialog should close, nothing happens
   - Note should still be there

5. Test Delete:
   - Click "Delete" again
   - Click the red "Delete" button in the dialog
   - Should redirect to /dashboard
   - Note should no longer appear in your notes list

Test 3: Error Handling

1. Navigate to edit page
2. Test empty title:
   - Clear the title field completely
   - Click "Save Changes"
   - Should show error: "Title is required"

3. Test long title:
   - Enter a title with more than 200 characters
   - Click "Save Changes"
   - Should show error: "Title must be 200 characters or less"

Test 4: Security (Optional)

1. Test non-existent note:
   - Manually navigate to /notes/invalid-id/edit
   - Should show 404 page

Expected Behavior Checklist

- Edit button appears on note view page
- Delete button appears on note view page (red)
- Edit page loads with pre-filled data
- Title and content can be modified
- Save redirects to note view with updates
- Cancel button returns to note view
- Delete shows confirmation dialog
- Dialog Cancel works correctly
- Dialog Confirm deletes and redirects to dashboard
- Validation errors display properly
- Dark mode styling looks good on all new components

Let me know if you encounter any issues or if everything works as expected!
