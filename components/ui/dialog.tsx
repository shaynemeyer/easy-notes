'use client';

import { useEffect, useRef } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 rounded-lg p-6 backdrop:bg-black/50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md w-full'
    >
      <h2 className='text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100'>{title}</h2>
      <p className='text-zinc-600 dark:text-zinc-400 mb-6'>{description}</p>
      <div className='flex gap-3 justify-end'>
        <button
          onClick={onClose}
          className='px-4 py-2 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className='px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 hover:text-white'
        >
          {confirmText}
        </button>
      </div>
    </dialog>
  );
}
