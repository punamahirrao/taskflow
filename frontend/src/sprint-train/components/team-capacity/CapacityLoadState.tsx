export function CapacityLoadState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="capacity-panel">
      {error ? (
        <>
          <p role="alert" className="capacity-danger">
            {error}
          </p>
          <button onClick={onRetry}>Retry</button>
        </>
      ) : (
        <p role="status">Loading team availability…</p>
      )}
    </div>
  );
}
