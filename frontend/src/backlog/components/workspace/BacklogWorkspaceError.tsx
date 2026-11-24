export function BacklogWorkspaceError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="border-b border-slate-100 bg-rose-50 px-5 py-2.5 text-sm text-rose-700"
    >
      {message}
    </p>
  );
}
