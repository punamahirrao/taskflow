import type { useSprintProgressChartsModel } from "../../features/sprint-progress/useSprintProgressChartsModel";
import { SprintVelocityBars } from "./SprintVelocityBars";

export function SprintVelocityChart({
  model,
}: {
  model: ReturnType<typeof useSprintProgressChartsModel>;
}) {
  const { t, closed } = model;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{t("reports.velocityTrend")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t("reports.velocityTrendNote")}</p>
      </div>
      {closed.length ? (
        <SprintVelocityBars model={model} />
      ) : (
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          {t("reports.closedSprintsHint")}
        </p>
      )}
    </article>
  );
}
