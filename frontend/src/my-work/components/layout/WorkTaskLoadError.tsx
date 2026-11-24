export function WorkTaskLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <p role="alert" className="my-work-error">
      Your tasks could not be loaded.{" "}
      <button className="my-work-link" type="button" onClick={() => void onRetry()}>
        Try again
      </button>
    </p>
  );
}
