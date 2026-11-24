import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorResultsSummary({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, macroStories, totalStoryPoints } = model;
  return (
    <div className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white">
      <p className="text-sm font-medium text-indigo-100">{t("aiEstimator.totalStoryPoints")}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight">{totalStoryPoints}</span>
        <span className="pb-1 text-sm text-indigo-100">{t("aiEstimator.points")}</span>
      </div>
      <p className="mt-3 text-xs text-indigo-100">
        {t("aiEstimator.estimatedAcross", { count: macroStories.length })}
      </p>
    </div>
  );
}
