import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { X } from "lucide-react";

export function CreateSprintHeader({ saving, onClose }: { saving: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide             text-indigo-600">
          {t("app.sprintTrain")}
        </p>
        <h2 id="create-sprint-title" className="mt-1 text-xl font-bold">
          {t("sprintTrain.createSprint")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{t("sprintTrain.createSprintDialogHint")}</p>
      </div>
      <button
        type="button"
        aria-label={t("sprintTrain.closeCreateSprintDialog")}
        disabled={saving}
        onClick={onClose}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <X size={18} />
      </button>
    </header>
  );
}
