import { NewNoteForm } from '@/components/new-note-form';
import { createNoteAction } from '../actions';

export default function NewNotePage() {
  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-zinc-900 dark:text-zinc-100'>Create New Note</h1>
        <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
          Write your thoughts with rich text formatting
        </p>
      </div>

      <NewNoteForm onSubmit={createNoteAction} />
    </div>
  );
}
