import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Zap } from "lucide-react";

export function BoardSprintModeButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${active ? "bg-accent text-white" : "border border-line bg-surface text-content hover:bg-subtle"}`}
    >
      <Zap size={15} />
      {active ? t("boards.activeSprintAndBacklog") : t("boards.allWork")}
    </button>
  );
}
