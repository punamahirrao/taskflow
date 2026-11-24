import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function CreateSprintActions({
  saving,
  hasProject,
  onClose,
}: {
  saving: boolean;
  hasProject: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        type="button"
        disabled={saving}
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        {t("sprintTrain.cancel")}
      </button>
      <button
        type="submit"
        disabled={saving || !hasProject}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? t("sprintTrain.creating") : t("sprintTrain.createSprint")}
      </button>
    </footer>
  );
}
