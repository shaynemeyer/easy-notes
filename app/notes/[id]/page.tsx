import { protectRoute } from "@/lib/session";

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await protectRoute(`/notes/${id}`);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Note Editor</h1>
        <p className="text-gray-600">Editing note with ID: {id}</p>
      </div>
    </div>
  );
}
