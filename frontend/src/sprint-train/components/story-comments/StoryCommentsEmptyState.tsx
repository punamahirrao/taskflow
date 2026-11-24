import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { MessageSquare } from "lucide-react";

export function StoryCommentsEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <MessageSquare className="mx-auto text-slate-300" size={24} />
      <p className="mt-2 text-sm font-semibold text-slate-700">{t("sprintTrain.noCommentsYet")}</p>
      <p className="mt-1 text-xs text-slate-500">{t("sprintTrain.noCommentsHint")}</p>
    </div>
  );
}
