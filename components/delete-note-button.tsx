'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { deleteNoteAction } from '@/app/(authenticated)/notes/actions';

interface DeleteNoteButtonProps {
  noteId: string;
  noteTitle: string;
}

export function DeleteNoteButton({ noteId, noteTitle }: DeleteNoteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteNoteAction(noteId);
  };

  return (
    <>
      <Button variant='danger' onClick={() => setIsDialogOpen(true)} disabled={isDeleting}>
        Delete
      </Button>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title='Delete Note'
        description={`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
      />
    </>
  );
}
