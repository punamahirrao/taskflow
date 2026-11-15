import type { Sprint, Task } from "../../common/entities/task";
import type { BurnupSeries } from "../entities/portfolio";

export function pointsFor(estimate: string): number {
  const parsed = Number.parseFloat(estimate);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function recentVelocity(sprints: Sprint[]): number {
  const recent = sprints.slice(0, 3);
  return recent.length
    ? Math.round(recent.reduce((sum, sprint) => sum + (sprint.velocity_points ?? 0), 0) / recent.length)
    : 0;
}

export function buildBurnup(tasks: Task[], now: number): BurnupSeries {
  const start = now - 56 * 86400000;
  const baseline = tasks.filter((task) => task.completed_at && Date.parse(task.completed_at) < start).length;
  const x = (index: number) => 12 + index * 39;
  const y = (count: number) => 82 - (tasks.length ? count / tasks.length : 0) * 68;
  const values = Array.from({ length: 8 }, (_, week) => baseline + tasks.filter((task) => task.completed_at && Date.parse(task.completed_at) >= start && Date.parse(task.completed_at) <= start + (week + 1) * 7 * 86400000).length);
  return {
    scope: `12,${y(tasks.length)} 285,${y(tasks.length)}`,
    done: values.map((count, index) => `${x(index)},${y(count)}`).join(" "),
  };
}
