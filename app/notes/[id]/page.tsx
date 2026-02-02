export default function NoteEditorPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Note Editor</h1>
        <p className="text-gray-600">Editing note with ID: {params.id}</p>
      </div>
    </div>
  );
}
