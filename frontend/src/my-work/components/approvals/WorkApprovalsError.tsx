export function WorkApprovalsError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className="my-work-empty" role="alert">
      Could not load approvals.{" "}
      <button type="button" className="my-work-link" onClick={() => void onRetry()}>
        Try again
      </button>
    </p>
  );
}
