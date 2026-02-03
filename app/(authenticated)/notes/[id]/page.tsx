import { requireAuth } from "@/lib/session";
import { getNoteById } from "@/lib/notes";
import { notFound } from "next/navigation";

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {note.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Created {new Date(note.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          Note editor will be implemented here
        </p>
      </div>
    </div>
  );
}
