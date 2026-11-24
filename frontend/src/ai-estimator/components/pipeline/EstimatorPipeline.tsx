import { ArrowLeft } from "lucide-react";
import { EstimatorPanel } from "../../AiEstimatorPage.styles";
import { PIPELINE_STEPS } from "../../features/estimatorData";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import { EstimatorPipelineActions } from "./EstimatorPipelineActions";
import { EstimatorPipelineError } from "./EstimatorPipelineError";
import { EstimatorPipelineHeader } from "./EstimatorPipelineHeader";
import { EstimatorPipelineStage } from "./EstimatorPipelineStage";
import { EstimatorRequirementsSource } from "./EstimatorRequirementsSource";
export function EstimatorPipeline({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, setStep, estimationRun, completedStages, isComplete } = model;
  return (
    <EstimatorPanel>
      <button
        type="button"
        onClick={() => setStep("upload")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        {t("aiEstimator.backToDocument")}
      </button>
      <EstimatorPipelineHeader model={model} />
      <EstimatorRequirementsSource model={model} />
      <ol className="relative ml-5 space-y-0 border-l border-slate-200">
        {PIPELINE_STEPS.map((item, index) => {
          const stageStatus =
            estimationRun?.stages[["parsing", "extracting", "grouping", "estimating"][index]];
          const done = estimationRun ? stageStatus === "complete" : false;
          const active = estimationRun
            ? stageStatus === "running" || (stageStatus === "queued" && index === completedStages)
            : false;
          return (
            <EstimatorPipelineStage
              key={item.titleKey}
              model={model}
              item={item}
              done={done}
              active={active}
            />
          );
        })}
      </ol>
      {estimationRun?.status === "failed" && <EstimatorPipelineError model={model} />}
      {isComplete && <EstimatorPipelineActions model={model} />}
    </EstimatorPanel>
  );
}
