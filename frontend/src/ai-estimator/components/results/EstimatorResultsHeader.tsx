import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorResultsHeader({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, selectedDocument } = model;
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
        {t("aiEstimator.resultsEyebrow")}
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">{t("aiEstimator.macroStories")}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {t("aiEstimator.scopeInferred", { name: selectedDocument?.name ?? "" })}
      </p>
    </div>
  );
}
