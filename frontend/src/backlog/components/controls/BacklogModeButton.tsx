import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BacklogMode } from "../../entities/backlogControls";

export function BacklogModeButton({
  mode,
  active,
  onSelect,
}: {
  mode: BacklogMode;
  active: boolean;
  onSelect: (mode: BacklogMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${active ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
    >
      {t(mode === "groom" ? "backlog.refine" : "backlog.estimate")}
    </button>
  );
}
