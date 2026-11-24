import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function StoryHistoryLoading() {
  const { t } = useTranslation();
  return <p className="text-sm text-slate-500">{t("sprintTrain.loadingHistory")}</p>;
}
