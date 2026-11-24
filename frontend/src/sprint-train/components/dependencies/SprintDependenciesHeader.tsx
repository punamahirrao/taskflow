import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintDependenciesHeader() {
  const { t } = useTranslation();
  return (
    <header className="border-b border-slate-200 p-4">
      <h3 className="font-bold">{t("sprintTrain.dependencyMatrix")}</h3>
      <p className="mt-1 text-xs text-slate-500">{t("sprintTrain.dependencyMatrixHint")}</p>
    </header>
  );
}
