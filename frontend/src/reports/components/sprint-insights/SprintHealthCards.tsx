import type { Sprint } from "../../../features/tasks/entities/task";
import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";

function numericPoints(estimate: string) {
  const value = Number.parseFloat(estimate);
  return Number.isFinite(value) ? value : 1;
}
function sprintProgress(sprint: Sprint, now: number) {
  if (!sprint.start_date || !sprint.end_date) return 0.5;
  const start = Date.parse(`${sprint.start_date}T00:00:00`);
  const end = Date.parse(`${sprint.end_date}T23:59:59`);
  return Math.max(0, Math.min(1, (now - start) / Math.max(1, end - start)));
}
export function SprintHealthCards({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  const { t, now, active, tasks } = model;
  return (
    <div className="mt-3 space-y-3">
      {active.map((sprint) => {
        const sprintTasks = tasks.filter((task) => task.sprint === sprint.id);
        const initial = sprintTasks.reduce((sum, task) => sum + numericPoints(task.estimate), 0);
        const remaining = sprintTasks
          .filter((task) => task.status !== "done")
          .reduce((sum, task) => sum + numericPoints(task.estimate), 0);
        const elapsed = sprintProgress(sprint, now);
        const ideal = Math.round(initial * (1 - elapsed));
        const actualX = 24 + elapsed * 250;
        const actualY = 20 + 82 * (1 - (initial ? 1 - remaining / initial : 0));
        return (
          <div key={sprint.id} className="rounded-lg bg-slate-50 p-2">
            <div className="flex justify-between text-[calc(10px*var(--taskflow-font-scale,1))]">
              <span className="font-semibold text-slate-700">
                {sprint.goal
                  ? t("reports.sprintWithGoal", { name: sprint.name, goal: sprint.goal })
                  : sprint.name}
              </span>
              <span className={remaining > ideal ? "text-rose-600" : "text-emerald-700"}>
                {t("reports.burndownRemaining", { remaining, ideal })}
              </span>
            </div>
            <svg
              viewBox="0 0 300 120"
              role="img"
              aria-label={t("reports.burndownAria", { name: sprint.name })}
              className="mt-1 h-24 w-full"
            >
              <path d="M24 20 L274 102" stroke="#cbd5e1" strokeDasharray="4 4" fill="none" />
              <path
                d={`M24 20 L${actualX} ${actualY}`}
                stroke={remaining > ideal ? "#f43f5e" : "#6366f1"}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <circle
                cx={actualX}
                cy={actualY}
                r="4"
                fill={remaining > ideal ? "#f43f5e" : "#6366f1"}
              />
              <text x="24" y="116" fontSize="9" fill="#94a3b8">
                {t("reports.burndownStart")}
              </text>
              <text x="250" y="116" fontSize="9" fill="#94a3b8">
                {t("reports.burndownEnd")}
              </text>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
