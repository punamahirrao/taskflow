export function BoardFormError({ error }: { error: string }) {
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
      {error}
    </p>
  );
}
