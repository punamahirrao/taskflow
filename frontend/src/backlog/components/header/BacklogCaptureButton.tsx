import { Plus } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogCaptureButton({ onCapture }: { onCapture: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onCapture}
      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
    >
      <Plus size={16} /> {t("backlog.captureIdea")}
    </button>
  );
}
