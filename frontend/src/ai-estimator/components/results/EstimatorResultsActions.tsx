import { CheckCircle2, WandSparkles } from "lucide-react";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorResultsActions({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, busy, setStep, setConfirmation, macroStories, isComplete, addMacroStories } = model;
  return (
    <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={() => {
          setStep("deep-analysis");
          setConfirmation("");
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
      >
        <WandSparkles size={16} />
        {t("aiEstimator.deepAnalysis")}
      </button>
      <button
        type="button"
        disabled={busy || !isComplete || !macroStories.length}
        onClick={addMacroStories}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <CheckCircle2 size={16} />
        {t("aiEstimator.addStoriesToProject")}
      </button>
    </div>
  );
}
