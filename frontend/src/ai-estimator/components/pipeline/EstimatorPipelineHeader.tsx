import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorPipelineHeader({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, project, selectedDocument, isComplete } = model;
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
          {t("aiEstimator.pipelineEyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{t("aiEstimator.processing")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {project?.name} · {selectedDocument?.name}
        </p>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
        {isComplete ? (
          <CheckCircle2 size={14} />
        ) : (
          <LoaderCircle className="animate-spin" size={14} />
        )}
        {isComplete ? t("aiEstimator.pipelineComplete") : t("aiEstimator.working")}
      </span>
    </div>
  );
}
