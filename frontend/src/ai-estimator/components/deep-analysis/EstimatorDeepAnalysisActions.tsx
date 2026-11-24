import { CheckCircle2 } from "lucide-react";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorDeepAnalysisActions({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, busy, isComplete, detailedStoryCount, addDetailedStories } = model;
  return (
    <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
      <button
        type="button"
        disabled={busy || !isComplete || !detailedStoryCount}
        onClick={addDetailedStories}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <CheckCircle2 size={16} />
        {t("aiEstimator.createInProject")}
      </button>
    </div>
  );
}
