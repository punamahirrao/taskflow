import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { EstimatorPanel } from "../../AiEstimatorPage.styles";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import { EstimatorAddMacroStoryButton } from "./EstimatorAddMacroStoryButton";
import { EstimatorMacroStoryList } from "./EstimatorMacroStoryList";
import { EstimatorResultsActions } from "./EstimatorResultsActions";
import { EstimatorResultsHeader } from "./EstimatorResultsHeader";
import { EstimatorResultsSummary } from "./EstimatorResultsSummary";
export function EstimatorResults({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, setStep, confirmation } = model;
  return (
    <EstimatorPanel>
      <button
        type="button"
        onClick={() => setStep("pipeline")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        {t("aiEstimator.backToPipeline")}
      </button>
      <EstimatorResultsHeader model={model} />
      <EstimatorResultsSummary model={model} />
      {confirmation && (
        <p
          role="status"
          className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <CheckCircle2 size={17} />
          {confirmation}
        </p>
      )}
      <EstimatorMacroStoryList model={model} />
      <EstimatorAddMacroStoryButton model={model} />
      <EstimatorResultsActions model={model} />
    </EstimatorPanel>
  );
}
