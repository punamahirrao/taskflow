import { Flame } from "lucide-react";
import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";
import { SprintHealthCards } from "./SprintHealthCards";
import { SprintHealthHeader } from "./SprintHealthHeader";
export function SprintHealthPanel({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  const { t, active } = model;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <SprintHealthHeader model={model} />
      {active.length ? (
        <SprintHealthCards model={model} />
      ) : (
        <p className="mt-3 text-xs text-slate-400">{t("reports.startSprintHint")}</p>
      )}
      <div className="mt-1 flex items-center gap-1 text-[calc(9px*var(--taskflow-font-scale,1))] text-slate-400">
        <Flame size={11} />
        {t("reports.burndownNote")}
      </div>
    </article>
  );
}
