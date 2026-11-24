import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function StoryCommentsLoading() {
  const { t } = useTranslation();
  return <p className="text-sm text-slate-500">{t("sprintTrain.loadingComments")}</p>;
}
