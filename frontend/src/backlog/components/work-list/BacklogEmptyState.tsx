import { Sparkles } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogEmptyState({ onCapture }: { onCapture: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <Sparkles size={21} />
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{t("backlog.pipelineClear")}</h3>
      <p className="mt-1 text-sm text-slate-500">{t("backlog.pipelineClearHint")}</p>
      <button
        type="button"
        onClick={onCapture}
        className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900"
      >
        {t("backlog.captureNextIdea")}
      </button>
    </div>
  );
}
