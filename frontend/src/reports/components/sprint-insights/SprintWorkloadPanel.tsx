import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";
import { SprintMemberWorkloads } from "./SprintMemberWorkloads";
import { SprintWorkloadHeader } from "./SprintWorkloadHeader";
export function SprintWorkloadPanel({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  const { t } = model;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <SprintWorkloadHeader model={model} />
      <SprintMemberWorkloads model={model} />
      <p className="mt-2 text-[calc(9px*var(--taskflow-font-scale,1))] text-slate-400">
        {t("reports.heatNote")}
      </p>
    </article>
  );
}
