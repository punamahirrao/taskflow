import type { useSprintProgressChartsModel } from "../../features/sprint-progress/useSprintProgressChartsModel";
import { SprintCapacityBars } from "./SprintCapacityBars";
interface LegendProps {
  color: string;
  label: string;
}
function Legend({ color, label }: LegendProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
export function SprintCapacityChart({
  model,
}: {
  model: ReturnType<typeof useSprintProgressChartsModel>;
}) {
  const { t, rows } = model;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{t("reports.deliveryVsCapacity")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t("reports.deliveryVsCapacityNote")}</p>
      </div>
      {rows.length ? (
        <SprintCapacityBars model={model} />
      ) : (
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          {t("reports.createSprintHint")}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-4 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-500">
        <Legend color="bg-indigo-100" label={t("reports.legendPlanned")} />
        <Legend color="bg-emerald-500" label={t("reports.legendCompleted")} />
        <Legend color="bg-amber-500" label={t("reports.legendCapacity")} />
      </div>
    </article>
  );
}
