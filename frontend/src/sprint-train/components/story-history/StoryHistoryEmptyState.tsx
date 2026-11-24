import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function StoryHistoryEmptyState() {
  const { t } = useTranslation();
  return (
    <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
      {t("sprintTrain.noHistory")}
    </p>
  );
}
