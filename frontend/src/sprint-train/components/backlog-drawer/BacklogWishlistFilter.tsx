import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BacklogDrawerProps } from "../../entities/backlogDrawer";

export function BacklogWishlistFilter({
  wishlistOnly,
  itemCount,
  onToggleWishlistView,
}: Pick<BacklogDrawerProps, "wishlistOnly" | "itemCount" | "onToggleWishlistView">) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="sprint-backlog-metric sprint-backlog-wishlist rounded-lg border"
      aria-pressed={wishlistOnly}
      onClick={onToggleWishlistView}
    >
      <span>{t(wishlistOnly ? "sprintTrain.allItems" : "sprintTrain.wishList")}</span>
      <strong>
        {t(itemCount === 1 ? "sprintTrain.itemCount" : "sprintTrain.itemsCount", {
          count: itemCount,
        })}
      </strong>
    </button>
  );
}
