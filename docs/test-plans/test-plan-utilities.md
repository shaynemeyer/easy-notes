# Test Plan Utilities & References

[← Back to Index](./test-plan-index.md)

## Manual Testing Checklist

Quick smoke test checklist:

- [ ] Can log in
- [ ] Header appears on dashboard
- [ ] Can click "New Note" button
- [ ] Editor loads without errors
- [ ] Can type in title and editor
- [ ] Can apply bold formatting
- [ ] Can apply italic formatting
- [ ] Can create H1 heading
- [ ] Can create bullet list
- [ ] Can submit form successfully
- [ ] Redirects to note page after submit
- [ ] Can log out from header
- [ ] Dark mode works correctly

---

## Database Testing Commands

### Check All Notes

```bash
bun --eval "
const { getDb } = require('./lib/db.ts');
const db = getDb();
const notes = db.prepare('SELECT id, title, user_id, created_at FROM notes ORDER BY created_at DESC LIMIT 10').all();
console.log(JSON.stringify(notes, null, 2));
"
```

### Verify Note Content JSON

```bash
bun --eval "
const { getDb } = require('./lib/db.ts');
const db = getDb();
const note = db.prepare('SELECT content_json FROM notes WHERE title = ?').get('YOUR_NOTE_TITLE');
const parsed = JSON.parse(note.content_json);
console.log(JSON.stringify(parsed, null, 2));
"
```

### Check User's Notes

```bash
bun --eval "
const { getNotesByUser } = require('./lib/notes.ts');
const userId = 'G4lFZoTTTnK3uKi2XU9KotaEWgf3hQ1q'; // Replace with actual user ID
const notes = await getNotesByUser(userId);
console.log(JSON.stringify(notes, null, 2));
"
```

### Delete Test Note

```bash
bun --eval "
const { getDb } = require('./lib/db.ts');
const db = getDb();
db.prepare('DELETE FROM notes WHERE title LIKE ?').run('Test%');
console.log('Test notes deleted');
"
```

---

## Known Issues

### Issue 1: Production Build with Bun SQLite

**Severity:** High
**Description:** `bun run build` fails because Next.js build uses Node.js workers which cannot load `bun:sqlite` module.
**Workaround:** Use `bun run dev` for development. Production builds require Node-compatible SQLite adapter.
**Status:** Known Limitation
