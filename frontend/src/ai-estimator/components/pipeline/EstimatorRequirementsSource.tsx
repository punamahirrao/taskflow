import { FileText, Sparkles } from "lucide-react";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorRequirementsSource({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, selectedDocument } = model;
  return (
    <div className="mb-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
          <FileText size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{selectedDocument?.name}</p>
          <p className="text-xs text-slate-500">
            {selectedDocument
              ? `${t("aiEstimator.fileSize", { size: (selectedDocument.size / 1024).toFixed(0) })} · `
              : ""}
            {t("aiEstimator.requirementsSource")}
          </p>
        </div>
        <Sparkles size={18} className="text-indigo-400" />
      </div>
    </div>
  );
}
