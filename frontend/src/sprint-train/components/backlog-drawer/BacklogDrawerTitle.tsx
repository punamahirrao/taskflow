import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { X } from "lucide-react";

export function BacklogDrawerTitle({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-[.15em] text-indigo-300">
          {t("sprintTrain.globalBacklogDrawer")}
        </p>
        <h2 className="mt-1 text-base font-bold">{t("sprintTrain.chooseFromBacklog")}</h2>
      </div>
      <button
        type="button"
        aria-label={t("sprintTrain.closeBacklogDrawer")}
        onClick={onClose}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}
