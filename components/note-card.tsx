'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateNotePreview, formatNoteDate, getPublicNoteUrl } from '@/lib/note-utils';
import type { Note } from '@/lib/notes';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!note.publicSlug) return;

    try {
      const url = getPublicNoteUrl(note.publicSlug);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Link
      href={`/notes/${note.id}`}
      className='block p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
    >
      <div className='flex items-start justify-between gap-2 mb-2'>
        <h2 className='text-xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 flex-1'>
          {note.title}
        </h2>
        {note.isPublic && (
          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 flex-shrink-0'>
            Public
          </span>
        )}
      </div>

      <p className='text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3'>
        {generateNotePreview(note.contentJson)}
      </p>

      {note.isPublic && note.publicSlug && (
        <div className='mb-3 flex items-center gap-2'>
          <input
            type='text'
            readOnly
            value={getPublicNoteUrl(note.publicSlug)}
            onClick={(e) => e.preventDefault()}
            className='flex-1 px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 truncate focus:outline-none'
          />
          <button
            type='button'
            onClick={handleCopyUrl}
            className='px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <p className='text-xs text-zinc-500 dark:text-zinc-500'>
        Updated {formatNoteDate(note.updatedAt)}
      </p>
    </Link>
  );
}
