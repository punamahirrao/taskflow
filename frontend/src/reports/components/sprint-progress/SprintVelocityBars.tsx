import type { useSprintProgressChartsModel } from "../../features/sprint-progress/useSprintProgressChartsModel";

export function SprintVelocityBars({
  model,
}: {
  model: ReturnType<typeof useSprintProgressChartsModel>;
}) {
  const { t, closed, maxVelocity } = model;
  return (
    <div className="mt-5 flex h-40 items-end gap-3 border-b border-l border-slate-200 px-2 pb-0">
      {closed.map(({ sprint }) => {
        const velocity = sprint.velocity_points ?? 0;
        return (
          <div
            key={sprint.id}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[calc(10px*var(--taskflow-font-scale,1))] font-semibold text-slate-700">
              {velocity}
            </span>
            <div
              className="w-full max-w-12 rounded-t-md bg-indigo-500"
              style={{ height: `${Math.max(3, (velocity / maxVelocity) * 105)}px` }}
              title={t("reports.velocityTitle", { name: sprint.name, velocity })}
            />
            <span className="w-full truncate text-center text-[calc(9px*var(--taskflow-font-scale,1))] text-slate-500">
              {sprint.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
