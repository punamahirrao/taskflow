import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function QuickCaptureActions({
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
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        {t("backlog.cancel")}
      </button>
      <button
        disabled={saving || !hasProject}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {saving ? t("backlog.capturing") : t("backlog.addToBacklog")}
      </button>
    </footer>
  );
}
