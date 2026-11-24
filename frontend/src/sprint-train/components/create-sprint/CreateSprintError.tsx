export function CreateSprintError({ error }: { error: string }) {
  return (
    <p role="alert" className="text-sm text-rose-600">
      {error}
    </p>
  );
}
