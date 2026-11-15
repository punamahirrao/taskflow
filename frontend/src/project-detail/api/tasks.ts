import { apiFetch } from "../../common/api/client";
import type { AgileBoard, AgileBoardType, BoardColumn, ProjectWorkflow, Sprint, SprintCloseResult, Task, TaskCreateInput, TaskStatus, WorkflowStatus } from "../../common/entities/task";
import type { TaskComment, TaskHistoryEntry } from "../../common/entities/taskActivity";

export const getTasks = (projectId?: number | string | null, sprintId?: number | "active" | null, boardId?: number | null) => {
  const params = new URLSearchParams();
  if (projectId !== undefined && projectId !== null) params.set("project_id", String(projectId));
  if (sprintId) params.set("sprint_id", String(sprintId));
  if (boardId) params.set("board_id", String(boardId));
  return apiFetch<Task[]>(`/tasks/${params.size ? `?${params}` : ""}`);
};

export const updateTask = (taskId: number, input: Partial<Task>) =>
  apiFetch<Task>(`/tasks/${taskId}/`, { method: "PATCH", body: JSON.stringify(input) });

export const getProjectWorkflow = (projectId: number) => apiFetch<ProjectWorkflow>(`/tasks/projects/${projectId}/workflow/`);
export const getAccessibleAgileBoards = (archived = false) => apiFetch<AgileBoard[]>(`/tasks/boards/${archived ? "?archived=true" : ""}`);

export const getProjectTasks = (projectId: number | string) => getTasks(projectId);

export const createTask = (input: TaskCreateInput) =>
  apiFetch<Task>("/tasks/", { method: "POST", body: JSON.stringify(input) });

export const updateTaskStatus = (taskId: number, status: TaskStatus) =>
  updateTask(taskId, { status });

export const getTaskComments = (taskId: number) => apiFetch<TaskComment[]>(`/tasks/${taskId}/comments/`);
export const createTaskComment = (taskId: number, content: string) => apiFetch<TaskComment>(`/tasks/${taskId}/comments/`, { method: "POST", body: JSON.stringify({ content }) });
export const updateTaskComment = (taskId: number, commentId: number, content: string) => apiFetch<TaskComment>(`/tasks/${taskId}/comments/${commentId}/`, { method: "PATCH", body: JSON.stringify({ content }) });
export const deleteTaskComment = (taskId: number, commentId: number) => apiFetch<void>(`/tasks/${taskId}/comments/${commentId}/`, { method: "DELETE" });
export const getTaskHistory = (taskId: number) => apiFetch<TaskHistoryEntry[]>(`/tasks/${taskId}/history/`);

export const getBoardColumns = (projectId: number) => apiFetch<BoardColumn[]>(`/tasks/projects/${projectId}/columns/`);
export const getAgileBoardColumns = (projectId: number, boardId: number) => apiFetch<BoardColumn[]>(`/tasks/projects/${projectId}/boards/${boardId}/columns/`);
export const createAgileBoardColumn = (projectId: number, boardId: number, input: { name: string; position?: number; status_ids?: number[] }) => apiFetch<BoardColumn>(`/tasks/projects/${projectId}/boards/${boardId}/columns/`, { method: "POST", body: JSON.stringify(input) });
export const updateAgileBoardColumn = (projectId: number, boardId: number, columnId: number, input: Partial<BoardColumn> & { status_ids?: number[] }) => apiFetch<BoardColumn>(`/tasks/projects/${projectId}/boards/${boardId}/columns/${columnId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteAgileBoardColumn = (projectId: number, boardId: number, columnId: number, move_to?: string) => apiFetch<void>(`/tasks/projects/${projectId}/boards/${boardId}/columns/${columnId}/${move_to ? `?move_to=${encodeURIComponent(move_to)}` : ""}`, { method: "DELETE" });
export const getAgileBoardWorkflow = (projectId: number, boardId: number) => apiFetch<ProjectWorkflow>(`/tasks/projects/${projectId}/boards/${boardId}/workflow/`);
export const createWorkflowStatus = (projectId: number, name: string) => apiFetch<WorkflowStatus>(`/tasks/projects/${projectId}/statuses/`, { method: "POST", body: JSON.stringify({ name }) });
export const updateWorkflowStatus = (projectId: number, statusId: number, input: { name?: string; column_id?: number }) => apiFetch<WorkflowStatus>(`/tasks/projects/${projectId}/statuses/${statusId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteWorkflowStatus = (projectId: number, statusId: number, replacement_status?: string) => apiFetch<void>(`/tasks/projects/${projectId}/statuses/${statusId}/`, { method: "DELETE", body: JSON.stringify({ replacement_status }) });
export const createProjectBoardColumn = (projectId: number, input: { name: string; create_empty?: boolean; position?: number; wip_limit?: number | null }) => apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/`, { method: "POST", body: JSON.stringify(input) });
export const getAgileBoards = (projectId: number, archived = false) => apiFetch<AgileBoard[]>(`/tasks/projects/${projectId}/boards/${archived ? "?archived=true" : ""}`);
export const createAgileBoard = (projectId: number, input: { name: string; board_type: AgileBoardType; description: string; member_ids?: number[] }) =>
  apiFetch<AgileBoard>(`/tasks/projects/${projectId}/boards/`, { method: "POST", body: JSON.stringify(input) });
export const updateAgileBoard = (projectId: number, boardId: number, input: Partial<AgileBoard> & { member_ids?: number[] }) =>
  apiFetch<AgileBoard>(`/tasks/projects/${projectId}/boards/${boardId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const addBoardColumn = (projectId: number, name: string, wip_limit: number | null, group_name = "") =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/`, { method: "POST", body: JSON.stringify({ name, wip_limit, group_name }) });
export const updateBoardColumn = (projectId: number, columnId: number, input: Partial<BoardColumn> & { status_ids?: number[] }) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/${columnId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteBoardColumn = (projectId: number, columnId: number) => apiFetch<void>(`/tasks/projects/${projectId}/columns/${columnId}/`, { method: "DELETE" });
export const getSprints = (projectId?: number | null, boardId?: number | null) => {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", String(projectId));
  if (boardId) params.set("board_id", String(boardId));
  return apiFetch<Sprint[]>(`/tasks/sprints/${params.size ? `?${params}` : ""}`);
};
export const createSprint = (project_id: number, name: string, is_active: boolean, start_date?: string, end_date?: string, goal = "", capacity_points?: number | null, board_id?: number | null) =>
  apiFetch<Sprint>("/tasks/sprints/", { method: "POST", body: JSON.stringify({ project_id, board_id, name, is_active, start_date: start_date || null, end_date: end_date || null, goal, capacity_points: capacity_points ?? null }) });
export const updateSprint = (sprintId: number, input: Partial<Sprint>) =>
  apiFetch<Sprint>(`/tasks/sprints/${sprintId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const closeSprint = (sprintId: number) =>
  apiFetch<SprintCloseResult>(`/tasks/sprints/${sprintId}/close/`, { method: "POST", body: JSON.stringify({}) });
