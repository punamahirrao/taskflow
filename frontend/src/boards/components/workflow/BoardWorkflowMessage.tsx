export function BoardWorkflowMessage({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="mb-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted shadow-sm"
    >
      {message}
    </p>
  );
}
