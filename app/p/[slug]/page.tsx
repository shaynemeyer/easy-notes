export default function PublicNotePage({ params }: { params: { slug: string } }) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-4'>Public Note</h1>
        <p className='text-gray-600'>Viewing public note with slug: {params.slug}</p>
      </div>
    </div>
  );
}
