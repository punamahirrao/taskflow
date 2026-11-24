import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorDeepAnalysisSummary({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, epics, finalEstimation, detailedStoryCount } = model;
  return (
    <div className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white">
      <p className="text-sm font-medium text-indigo-100">{t("aiEstimator.finalEstimation")}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight">{finalEstimation}</span>
        <span className="pb-1 text-sm text-indigo-100">{t("aiEstimator.storyPointsUnit")}</span>
      </div>
      <p className="mt-3 text-xs text-indigo-100">
        {t("aiEstimator.acrossEpics", { epics: epics.length, stories: detailedStoryCount })}
      </p>
    </div>
  );
}
