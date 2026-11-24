import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogControlsHeading() {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{t("backlog.prioritizedWork")}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{t("backlog.dragHint")}</p>
    </div>
  );
}
