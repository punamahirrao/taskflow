import type { Task } from "../../features/tasks/entities/task";

export function reorderBacklogItems(
  backlog: Task[],
  sourceId: number,
  targetTask: Task,
): number[] | null {
  const sourceTask = backlog.find((item) => item.id === sourceId);
  if (!sourceTask || sourceTask.project !== targetTask.project || sourceTask.id === targetTask.id)
    return null;
  const siblings = backlog.filter((item) => item.project === targetTask.project);
  const source = siblings.findIndex((item) => item.id === sourceTask.id);
  const target = siblings.findIndex((item) => item.id === targetTask.id);
  const reordered = [...siblings];
  const [item] = reordered.splice(source, 1);
  reordered.splice(target, 0, item);
  return reordered.map((entry) => entry.id);
}
