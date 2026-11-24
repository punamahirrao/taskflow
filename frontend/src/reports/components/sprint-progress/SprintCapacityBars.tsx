import type { useSprintProgressChartsModel } from "../../features/sprint-progress/useSprintProgressChartsModel";

export function SprintCapacityBars({
  model,
}: {
  model: ReturnType<typeof useSprintProgressChartsModel>;
}) {
  const { t, rows, maxValue } = model;
  return (
    <div className="mt-5 space-y-4">
      {rows.map(({ sprint, planned, delivered, capacity }) => (
        <div key={sprint.id}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="truncate text-xs font-semibold text-slate-700">
              {sprint.is_active
                ? t("reports.sprintActive", { name: sprint.name })
                : sprint.is_closed
                  ? t("reports.sprintClosed", { name: sprint.name })
                  : t("reports.sprintPlanned", { name: sprint.name })}
            </span>
            <span className="shrink-0 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-500">
              {capacity !== null
                ? t("reports.pointsSummaryCapacity", { delivered, planned, capacity })
                : t("reports.pointsSummary", { delivered, planned })}
            </span>
          </div>
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-indigo-100"
              style={{ width: `${Math.max(2, (planned / maxValue) * 100)}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
              style={{
                width: `${Math.max(delivered ? 2 : 0, (delivered / maxValue) * 100)}%`,
              }}
            />
            {capacity !== null && (
              <span
                className="absolute inset-y-0 border-l-2 border-amber-500"
                style={{ left: `${Math.min((capacity / maxValue) * 100, 99)}%` }}
                title={t("reports.capacityTitle", { capacity })}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
