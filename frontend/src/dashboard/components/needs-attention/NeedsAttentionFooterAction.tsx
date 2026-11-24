import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function NeedsAttentionFooterAction({
  hasMore,
  hasAdditional,
  projectId,
  onMore,
  onShowLess,
}: {
  hasMore: boolean;
  hasAdditional: boolean;
  projectId: number | null;
  onMore: () => void;
  onShowLess: () => void;
}) {
  if (hasMore) {
    return (
      <button
        className="delivery-link"
        type="button"
        aria-controls="delivery-attention-list"
        aria-label="More attention items"
        onClick={onMore}
      >
        More <ArrowRight size={15} />
      </button>
    );
  }
  if (hasAdditional) {
    return (
      <Link
        className="delivery-link"
        to={projectId !== null ? `/project/${projectId}` : "/projects"}
      >
        View project work <ArrowUpRight size={15} />
      </Link>
    );
  }
  return (
    <button
      className="delivery-link"
      type="button"
      aria-controls="delivery-attention-list"
      onClick={onShowLess}
    >
      Show less
    </button>
  );
}
