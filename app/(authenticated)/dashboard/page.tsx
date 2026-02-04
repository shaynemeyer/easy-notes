import Link from 'next/link';
import { requireAuth } from '@/lib/session';
import { getNotesByUser } from '@/lib/notes';
import { NoteCard } from '@/components/note-card';

export default async function DashboardPage() {
  const user = await requireAuth();
  const notes = await getNotesByUser(user.id);

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-zinc-900 dark:text-zinc-100'>My Notes</h1>
          <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
            Create and manage your notes
          </p>
        </div>
        <Link
          href='/notes/new'
          className='px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900'
        >
          + New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-xl text-zinc-600 dark:text-zinc-400 mb-4'>No notes yet</p>
          <p className='text-sm text-zinc-500 dark:text-zinc-500'>
            Get started by creating your first note
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
