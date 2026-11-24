import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { EstimatorPanel } from "../../AiEstimatorPage.styles";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import { EstimatorDeepAnalysisActions } from "./EstimatorDeepAnalysisActions";
import { EstimatorDeepAnalysisHeader } from "./EstimatorDeepAnalysisHeader";
import { EstimatorDeepAnalysisSummary } from "./EstimatorDeepAnalysisSummary";
import { EstimatorEpicCard } from "./EstimatorEpicCard";
export function EstimatorDeepAnalysis({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, setStep, expandedEpics, confirmation, setConfirmation, epics } = model;
  return (
    <EstimatorPanel>
      <button
        type="button"
        onClick={() => {
          setStep("results");
          setConfirmation("");
        }}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        {t("aiEstimator.backToMacroStories")}
      </button>
      <EstimatorDeepAnalysisHeader model={model} />
      <EstimatorDeepAnalysisSummary model={model} />
      {confirmation && (
        <p
          role="status"
          className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <CheckCircle2 size={17} />
          {confirmation}
        </p>
      )}
      <div className="space-y-3">
        {epics.map((epic) => {
          const expanded = expandedEpics.includes(epic.id);
          const epicPoints = epic.stories.reduce((sum, story) => sum + story.points, 0);
          return (
            <EstimatorEpicCard
              key={epic.id}
              model={model}
              epic={epic}
              expanded={expanded}
              epicPoints={epicPoints}
            />
          );
        })}
      </div>
      <EstimatorDeepAnalysisActions model={model} />
    </EstimatorPanel>
  );
}
