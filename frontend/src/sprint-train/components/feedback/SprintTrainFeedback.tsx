import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { AlertTriangle, Check } from "lucide-react";

export function SprintTrainFeedback({
  error,
  message,
  onDismiss,
}: {
  error: string;
  message: string;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  if (!error && !message) return null;
  return (
    <div
      role="status"
      className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}
    >
      {error ? <AlertTriangle size={16} /> : <Check size={16} />}
      <span>{error || message}</span>
      <button type="button" onClick={onDismiss} className="ml-auto text-xs font-semibold">
        {t("sprintTrain.dismiss")}
      </button>
    </div>
  );
}
