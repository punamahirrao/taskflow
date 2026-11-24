import { ArrowRight } from "lucide-react";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorPipelineActions({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, setStep } = model;
  return (
    <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={() => setStep("results")}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        {t("aiEstimator.next")}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
