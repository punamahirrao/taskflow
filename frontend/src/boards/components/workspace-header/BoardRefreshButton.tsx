import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { RefreshCw } from "lucide-react";

export function BoardRefreshButton({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onRefresh}
      aria-label={t("boards.refreshAria")}
      className="rounded-lg border border-line bg-surface p-2.5 text-muted hover:text-accent"
    >
      <RefreshCw size={16} />
    </button>
  );
}
