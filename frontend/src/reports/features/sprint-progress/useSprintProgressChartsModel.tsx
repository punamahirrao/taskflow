import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Sprint, Task } from "../../../features/tasks/entities/task";
import type { SprintProgressRow } from "../../entities/reports";
interface SprintProgressChartsProps {
  tasks: Task[];
  sprints: Sprint[];
}
interface LegendProps {
  color: string;
  label: string;
}
function points(task: Task) {
  const value = Number.parseFloat(task.estimate);
  return Number.isFinite(value) ? value : 0;
}

export function useSprintProgressChartsModel({ tasks, sprints }: SprintProgressChartsProps) {
  const { t } = useTranslation();
  const visible = [...sprints]
    .sort((first, second) =>
      (first.start_date ?? "9999").localeCompare(second.start_date ?? "9999"),
    )
    .slice(-6);
  const rows = visible.map((sprint): SprintProgressRow => {
    const sprintTasks = tasks.filter(
      (task) => task.sprint === sprint.id && task.status !== "backlog",
    );
    const planned = sprintTasks.reduce((sum, task) => sum + points(task), 0);
    const delivered = sprintTasks
      .filter((task) => task.status === "done")
      .reduce((sum, task) => sum + points(task), 0);
    const capacity = sprint.capacity_points ?? (sprint.is_closed ? sprint.velocity_points : null);
    return { sprint, planned, delivered, capacity };
  });
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => [row.planned, row.delivered, row.capacity ?? 0]),
  );
  const closed = rows
    .filter((row) => row.sprint.is_closed && row.sprint.velocity_points !== null)
    .slice(-6);
  const maxVelocity = Math.max(1, ...closed.map((row) => row.sprint.velocity_points ?? 0));

  return { t, rows, maxValue, closed, maxVelocity };
}
