export function WorkApprovalsHeader({
  reviewCount,
  onView,
}: {
  reviewCount: number;
  onView?: () => void;
}) {
  return (
    <header className="my-work-panel-heading">
      <h2>
        My Approvals <span>({reviewCount} to review)</span>
      </h2>
      {onView && (
        <button type="button" className="my-work-link" onClick={onView}>
          View all →
        </button>
      )}
    </header>
  );
}
