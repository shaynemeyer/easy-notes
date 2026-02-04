'use client';

import { useState } from 'react';
import { getPublicNoteUrl } from '@/lib/note-utils';

interface ShareNoteToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  publicSlug?: string | null;
}

export function ShareNoteToggle({ value, onChange, publicSlug }: ShareNoteToggleProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl = publicSlug ? getPublicNoteUrl(publicSlug) : '';

  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <input
          type='checkbox'
          id='share-toggle'
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className='w-4 h-4 text-blue-600 border-zinc-300 dark:border-zinc-700 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600'
        />
        <label
          htmlFor='share-toggle'
          className='text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer'
        >
          Make this note public
        </label>
      </div>

      {value && publicSlug && (
        <div className='pl-7 space-y-2'>
          <label className='block text-xs font-medium text-zinc-700 dark:text-zinc-300'>
            Public URL
          </label>
          <div className='flex gap-2'>
            <input
              type='text'
              readOnly
              value={publicUrl}
              className='flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none'
            />
            <button
              type='button'
              onClick={handleCopy}
              className='px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
