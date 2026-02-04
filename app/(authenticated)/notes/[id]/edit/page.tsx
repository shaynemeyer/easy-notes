import { requireAuth } from '@/lib/session';
import { getNoteById } from '@/lib/notes';
import { notFound } from 'next/navigation';
import { EditNoteForm } from '@/components/edit-note-form';
import { updateNoteAction } from '@/app/(authenticated)/notes/actions';
import Link from 'next/link';

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const note = await getNoteById(user.id, id);

  if (!note) {
    notFound();
  }

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-6'>
        <Link
          href={`/notes/${id}`}
          className='inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors'
        >
          <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Back to Note
        </Link>
      </div>

      <h1 className='text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8'>Edit Note</h1>

      <EditNoteForm
        noteId={id}
        initialTitle={note.title}
        initialContent={note.contentJson}
        initialIsPublic={note.isPublic}
        publicSlug={note.publicSlug}
        onSubmit={updateNoteAction}
      />
    </div>
  );
}
