import { ArrowRight } from "lucide-react";

export function RecentActivityFooter({
  visibleCount,
  totalCount,
  hasMore,
  onToggleMore,
}: {
  visibleCount: number;
  totalCount: number;
  hasMore: boolean;
  onToggleMore: () => void;
}) {
  return (
    <div className="delivery-panel-footer">
      <span>
        Showing {visibleCount} of {totalCount}
      </span>
      <button
        className="delivery-link"
        type="button"
        aria-controls="delivery-activity-list"
        aria-label={hasMore ? "More recent activity" : "Show less recent activity"}
        onClick={onToggleMore}
      >
        {hasMore ? (
          <>
            More <ArrowRight size={15} />
          </>
        ) : (
          "Show less"
        )}
      </button>
    </div>
  );
}
