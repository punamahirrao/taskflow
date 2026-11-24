import { NeedsAttentionFooterAction } from "./NeedsAttentionFooterAction";

export function NeedsAttentionFooter({
  visibleCount,
  totalCount,
  hasMore,
  hasAdditional,
  projectId,
  onMore,
  onShowLess,
}: {
  visibleCount: number;
  totalCount: number;
  hasMore: boolean;
  hasAdditional: boolean;
  projectId: number | null;
  onMore: () => void;
  onShowLess: () => void;
}) {
  return (
    <div className="delivery-panel-footer">
      <span>
        Showing {visibleCount} of {totalCount}
      </span>
      <NeedsAttentionFooterAction
        hasMore={hasMore}
        hasAdditional={hasAdditional}
        projectId={projectId}
        onMore={onMore}
        onShowLess={onShowLess}
      />
    </div>
  );
}
