export function OrganizationProjectsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <p role="alert" className="text-sm text-danger">
      {message}{" "}
      <button type="button" className="project-text-link" onClick={onRetry}>
        Retry
      </button>
    </p>
  );
}
