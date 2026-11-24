export function WorkTasksFooter({
  visibleCount,
  totalCount,
  onView,
}: {
  visibleCount: number;
  totalCount: number;
  onView: () => void;
}) {
  return (
    <footer className="my-work-panel-footer">
      <span>
        Showing {visibleCount} of {totalCount} tasks
      </span>
      <button type="button" className="my-work-link" onClick={onView}>
        See all results →
      </button>
    </footer>
  );
}
