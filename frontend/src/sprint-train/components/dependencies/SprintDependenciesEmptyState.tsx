import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintDependenciesEmptyState() {
  const { t } = useTranslation();
  return (
    <p className="p-8 text-center text-sm text-slate-500">
      {t("sprintTrain.noUnresolvedDependencies")}
    </p>
  );
}
