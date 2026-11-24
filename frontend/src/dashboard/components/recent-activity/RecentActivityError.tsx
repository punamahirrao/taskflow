export function RecentActivityError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className="delivery-empty" role="alert">
      Could not load activity.{" "}
      <button className="delivery-link" type="button" onClick={() => void onRetry()}>
        Try again
      </button>
    </p>
  );
}
