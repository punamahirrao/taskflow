import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorDeepAnalysisHeader({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t } = model;
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
        {t("aiEstimator.deepAnalysis")}
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">{t("aiEstimator.epicsAndStories")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("aiEstimator.deepAnalysisHint")}</p>
    </div>
  );
}
