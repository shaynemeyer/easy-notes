'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NoteEditor } from '@/components/note-editor';
import { ShareNoteToggle } from '@/components/share-note-toggle';

interface NewNoteFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

export function NewNoteForm({ onSubmit }: NewNoteFormProps) {
  const [title, setTitle] = useState('Untitled note');
  const [contentJson, setContentJson] = useState(EMPTY_TIPTAP_DOC);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('contentJson', contentJson);
      formData.append('isPublic', String(isPublic));

      await onSubmit(formData);
    } catch (err) {
      // Ignore redirect errors (NEXT_REDIRECT)
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to create note');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
          <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        </div>
      )}

      <Input
        label='Title'
        name='title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={(e) => {
          if (e.target.value === 'Untitled note') {
            setTitle('');
          }
        }}
        placeholder='Enter note title...'
      />

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-zinc-900 dark:text-zinc-100'>
          Content
        </label>
        <NoteEditor initialContent={contentJson} onChange={setContentJson} editable={true} />
      </div>

      <ShareNoteToggle value={isPublic} onChange={setIsPublic} />

      <Button type='submit' loading={isSubmitting} disabled={isSubmitting}>
        Create Note
      </Button>
    </form>
  );
}
