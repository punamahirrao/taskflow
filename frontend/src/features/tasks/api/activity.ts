import { apiFetch } from "../../../common/api/client";
import type { TaskComment, TaskHistoryEntry } from "../entities/taskActivity";

export const getTaskComments = (taskId: number) =>
  apiFetch<TaskComment[]>(`/tasks/${taskId}/comments/`);

export const createTaskComment = (taskId: number, content: string) =>
  apiFetch<TaskComment>(`/tasks/${taskId}/comments/`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const updateTaskComment = (taskId: number, commentId: number, content: string) =>
  apiFetch<TaskComment>(`/tasks/${taskId}/comments/${commentId}/`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });

export const deleteTaskComment = (taskId: number, commentId: number) =>
  apiFetch<void>(`/tasks/${taskId}/comments/${commentId}/`, { method: "DELETE" });

export const getTaskHistory = (taskId: number) =>
  apiFetch<TaskHistoryEntry[]>(`/tasks/${taskId}/history/`);
