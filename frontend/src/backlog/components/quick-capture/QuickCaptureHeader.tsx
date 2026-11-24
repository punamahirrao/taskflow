import { X } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function QuickCaptureHeader({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="mb-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-600">
          {t("backlog.ideaEngine")}
        </p>
        <h2 id="capture-title" className="mt-1 text-xl font-semibold text-slate-900">
          {t("backlog.captureTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{t("backlog.captureHint")}</p>
      </div>
      <button
        type="button"
        aria-label={t("backlog.close")}
        onClick={onClose}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
      >
        <X size={18} />
      </button>
    </header>
  );
}
