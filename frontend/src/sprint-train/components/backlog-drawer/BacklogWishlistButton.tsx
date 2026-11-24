import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Bookmark } from "lucide-react";
import type { Task } from "../../../features/tasks/entities/task";

export function BacklogWishlistButton({
  task,
  wishlistSavingId,
  onToggleWishlist,
}: {
  task: Task;
  wishlistSavingId: number | null;
  onToggleWishlist: (task: Task) => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="sprint-wishlist-toggle"
      aria-pressed={Boolean(task.is_wishlisted)}
      aria-label={t(
        task.is_wishlisted ? "sprintTrain.removeFromWishList" : "sprintTrain.addToWishList",
        { title: task.title },
      )}
      disabled={wishlistSavingId !== null}
      onClick={(event) => {
        event.stopPropagation();
        onToggleWishlist(task);
      }}
    >
      <Bookmark size={16} aria-hidden="true" fill={task.is_wishlisted ? "currentColor" : "none"} />
    </button>
  );
}
