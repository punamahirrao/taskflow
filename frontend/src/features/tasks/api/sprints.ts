import { apiFetch } from "../../../common/api/client";
import type { Sprint, SprintCloseResult } from "../entities/task";

export const getSprints = (projectId?: number | null, boardId?: number | null) => {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", String(projectId));
  if (boardId) params.set("board_id", String(boardId));
  return apiFetch<Sprint[]>(`/tasks/sprints/${params.size ? `?${params}` : ""}`);
};

export const createSprint = (
  project_id: number,
  name: string,
  is_active: boolean,
  start_date?: string,
  end_date?: string,
  goal = "",
  capacity_points?: number | null,
  board_id?: number | null,
) =>
  apiFetch<Sprint>("/tasks/sprints/", {
    method: "POST",
    body: JSON.stringify({
      project_id,
      board_id,
      name,
      is_active,
      start_date: start_date || null,
      end_date: end_date || null,
      goal,
      capacity_points: capacity_points ?? null,
    }),
  });

export const updateSprint = (sprintId: number, input: Partial<Sprint>) =>
  apiFetch<Sprint>(`/tasks/sprints/${sprintId}/`, { method: "PATCH", body: JSON.stringify(input) });

export const closeSprint = (sprintId: number) =>
  apiFetch<SprintCloseResult>(`/tasks/sprints/${sprintId}/close/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
