export function BoardsDirectoryError({ error }: { error: string }) {
  return (
    <p role="alert" className="mb-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
      {error}
    </p>
  );
}
