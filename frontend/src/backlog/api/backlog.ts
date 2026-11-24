import { getTasks } from "../../features/tasks/api/tasks";
import type { Task } from "../../features/tasks/entities/task";

/** Fetches the accessible work items used by the Backlog screen. */
export async function getBacklogTasks(
  projectId: number | null,
  signal?: AbortSignal,
): Promise<Task[]> {
  const tasks = await getTasks(projectId, null, null, signal);
  return tasks.filter((task) => task.status === "backlog");
}
