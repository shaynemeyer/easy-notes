import { requireAuth } from "@/lib/session";
import { getNoteById } from "@/lib/notes";
import { notFound } from "next/navigation";
import { formatNoteDate } from "@/lib/note-utils";
import { NoteEditor } from "@/components/note-editor";
import { DeleteNoteButton } from "@/components/delete-note-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const note = await getNoteById(user.id, id);

  if (!note) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/notes/${note.id}/edit`} className="w-full">
          <Button variant="secondary">Edit</Button>
        </Link>
        <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {note.title}
        </h1>
        <div className="mt-2 flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Created {formatNoteDate(note.createdAt)}</span>
          <span>•</span>
          <span>Updated {formatNoteDate(note.updatedAt)}</span>
        </div>
      </div>

      <NoteEditor initialContent={note.contentJson} editable={false} />
    </div>
  );
}
