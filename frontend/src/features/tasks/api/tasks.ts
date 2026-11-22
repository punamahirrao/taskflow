import { apiFetch } from "../../../common/api/client";
import type { Task, TaskCreateInput, TaskStatus } from "../entities/task";

export const getTasks = (
  projectId?: number | string | null,
  sprintId?: number | "active" | null,
  boardId?: number | null,
  signal?: AbortSignal,
) => {
  const params = new URLSearchParams();
  if (projectId !== undefined && projectId !== null) params.set("project_id", String(projectId));
  if (sprintId) params.set("sprint_id", String(sprintId));
  if (boardId) params.set("board_id", String(boardId));
  return apiFetch<Task[]>(`/tasks/${params.size ? `?${params}` : ""}`, { signal });
};

export const updateTask = (taskId: number, input: Partial<Task>) =>
  apiFetch<Task>(`/tasks/${taskId}/`, { method: "PATCH", body: JSON.stringify(input) });

export const reorderBacklog = (projectId: number, taskIds: number[]) =>
  apiFetch<{ ranks: { id: number; rank: number }[] }>("/tasks/reorder/", {
    method: "POST",
    body: JSON.stringify({ project_id: projectId, task_ids: taskIds }),
  });

export const getProjectTasks = (projectId: number | string) => getTasks(projectId);

export const createTask = (input: TaskCreateInput) =>
  apiFetch<Task>("/tasks/", { method: "POST", body: JSON.stringify(input) });

export const updateTaskStatus = (taskId: number, status: TaskStatus) =>
  updateTask(taskId, { status });
