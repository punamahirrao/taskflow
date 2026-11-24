import { CircleHelp } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogEstimationHint() {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 border-b border-violet-100 bg-violet-50 px-5 py-3 text-xs text-violet-800">
      <CircleHelp size={15} className="shrink-0" />
      <p>{t("backlog.estimationMode")}</p>
    </div>
  );
}
