import type { Task } from "../../../features/tasks/entities/task";
import { BacklogHealthCard } from "../../components/health-summary/BacklogHealthCard";
import { BacklogHealthGrid } from "../../components/health-summary/BacklogHealthGrid";

export function BacklogHealthSummary({
  tasks,
  backlog,
  asOf,
}: {
  tasks: Task[];
  backlog: Task[];
  asOf: number;
}) {
  const pipeline = tasks.filter((task) => task.status === "backlog");
  const ready = pipeline.filter((task) => task.ready_for_sprint).length;
  const missingEstimate = backlog.filter((task) => !task.estimate.trim()).length;
  const blocked = backlog.filter(
    (task) =>
      task.blocked ||
      task.blocked_by.some((id) =>
        tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
      ),
  ).length;
  const stale = backlog.filter(
    (task) =>
      asOf - Date.parse(task.updated_at ?? task.created_at ?? new Date(asOf).toISOString()) >
      14 * 86400000,
  ).length;
  return (
    <BacklogHealthGrid>
      <BacklogHealthCard kind="pipeline" value={pipeline.length} />
      <BacklogHealthCard kind="ready" value={ready} />
      <BacklogHealthCard kind="estimate" value={missingEstimate} />
      <BacklogHealthCard kind="blocked" value={blocked} />
      <BacklogHealthCard kind="stale" value={stale} />
    </BacklogHealthGrid>
  );
}
