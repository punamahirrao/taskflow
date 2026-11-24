import { Activity } from "lucide-react";
import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";
export function SprintHealthHeader({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  const { t } = model;
  return (
    <div className="flex items-center gap-2">
      <Activity size={16} className="text-sky-600" />
      <h3 className="text-sm font-semibold text-slate-800">{t("reports.sprintBurndown")}</h3>
      <span className="ml-auto text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-400">
        {t("reports.activeSprints")}
      </span>
    </div>
  );
}
