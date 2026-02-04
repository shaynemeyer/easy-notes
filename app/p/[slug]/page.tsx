import { getNoteByPublicSlug } from '@/lib/notes';
import { notFound } from 'next/navigation';
import { NoteEditor } from '@/components/note-editor';

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteByPublicSlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-zinc-950'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-6'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'>
            Public Note
          </span>
        </div>

        <h1 className='text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8'>{note.title}</h1>

        <div className='bg-white dark:bg-zinc-900 rounded-lg shadow-sm'>
          <NoteEditor initialContent={note.contentJson} editable={false} />
        </div>
      </div>
    </div>
  );
}
