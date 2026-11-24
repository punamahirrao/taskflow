import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorPipelineError({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, estimationRun, retryPipeline } = model;
  if (!estimationRun) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-rose-50 px-4 py-3">
      <p role="alert" className="text-sm text-rose-700">
        {estimationRun.error || t("aiEstimator.estimationFailed")}
      </p>
      <button
        type="button"
        onClick={() => void retryPipeline()}
        className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
      >
        {t("aiEstimator.retry")}
      </button>
    </div>
  );
}
