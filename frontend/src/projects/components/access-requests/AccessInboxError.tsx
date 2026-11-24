export function AccessInboxError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <p role="alert" className="mt-2 text-sm text-danger">
      {message}{" "}
      <button className="project-text-link" type="button" onClick={onRetry}>
        Retry
      </button>
    </p>
  );
}
