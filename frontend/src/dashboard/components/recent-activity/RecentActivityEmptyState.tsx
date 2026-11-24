export function RecentActivityEmptyState({ isFetching }: { isFetching: boolean }) {
  return (
    <p className="delivery-empty" role={isFetching ? "status" : undefined}>
      {isFetching ? "Loading activity…" : "No work item activity has been recorded."}
    </p>
  );
}
