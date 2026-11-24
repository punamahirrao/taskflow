import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogLoadingState() {
  const { t } = useTranslation();
  return <div className="p-12 text-center text-sm text-slate-500">{t("backlog.loading")}</div>;
}
