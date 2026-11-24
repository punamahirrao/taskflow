import { Gauge } from "lucide-react";
import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";
export function SprintWorkloadHeader({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  const { t } = model;
  return (
    <div className="flex items-center gap-2">
      <Gauge size={16} className="text-indigo-600" />
      <h3 className="text-sm font-semibold text-slate-800">{t("reports.workloadHeatmap")}</h3>
      <span className="ml-auto text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-400">
        {t("reports.openWorkByOwner")}
      </span>
    </div>
  );
}
