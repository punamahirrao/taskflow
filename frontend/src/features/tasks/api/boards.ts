import { apiFetch } from "../../../common/api/client";
import type {
  AgileBoard,
  AgileBoardType,
  BoardColumn,
  ProjectWorkflow,
  WorkflowStatus,
} from "../entities/task";

export const getProjectWorkflow = (projectId: number) =>
  apiFetch<ProjectWorkflow>(`/tasks/projects/${projectId}/workflow/`);

export const getAccessibleAgileBoards = (archived = false, signal?: AbortSignal) =>
  apiFetch<AgileBoard[]>(`/tasks/boards/${archived ? "?archived=true" : ""}`, { signal });

export const getBoardColumns = (projectId: number) =>
  apiFetch<BoardColumn[]>(`/tasks/projects/${projectId}/columns/`);

export const getAgileBoardColumns = (projectId: number, boardId: number) =>
  apiFetch<BoardColumn[]>(`/tasks/projects/${projectId}/boards/${boardId}/columns/`);

export const createAgileBoardColumn = (
  projectId: number,
  boardId: number,
  input: { name: string; position?: number; status_ids?: number[] },
) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/boards/${boardId}/columns/`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateAgileBoardColumn = (
  projectId: number,
  boardId: number,
  columnId: number,
  input: Partial<BoardColumn> & { status_ids?: number[] },
) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/boards/${boardId}/columns/${columnId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteAgileBoardColumn = (
  projectId: number,
  boardId: number,
  columnId: number,
  move_to?: string,
) =>
  apiFetch<void>(
    `/tasks/projects/${projectId}/boards/${boardId}/columns/${columnId}/${move_to ? `?move_to=${encodeURIComponent(move_to)}` : ""}`,
    { method: "DELETE" },
  );

export const getAgileBoardWorkflow = (projectId: number, boardId: number) =>
  apiFetch<ProjectWorkflow>(`/tasks/projects/${projectId}/boards/${boardId}/workflow/`);

export const createWorkflowStatus = (projectId: number, name: string) =>
  apiFetch<WorkflowStatus>(`/tasks/projects/${projectId}/statuses/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const updateWorkflowStatus = (
  projectId: number,
  statusId: number,
  input: { name?: string; column_id?: number },
) =>
  apiFetch<WorkflowStatus>(`/tasks/projects/${projectId}/statuses/${statusId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteWorkflowStatus = (
  projectId: number,
  statusId: number,
  replacement_status?: string,
) =>
  apiFetch<void>(`/tasks/projects/${projectId}/statuses/${statusId}/`, {
    method: "DELETE",
    body: JSON.stringify({ replacement_status }),
  });

export const createProjectBoardColumn = (
  projectId: number,
  input: { name: string; create_empty?: boolean; position?: number; wip_limit?: number | null },
) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getAgileBoards = (projectId: number, archived = false) =>
  apiFetch<AgileBoard[]>(`/tasks/projects/${projectId}/boards/${archived ? "?archived=true" : ""}`);

export const createAgileBoard = (
  projectId: number,
  input: { name: string; board_type: AgileBoardType; description: string; member_ids?: number[] },
) =>
  apiFetch<AgileBoard>(`/tasks/projects/${projectId}/boards/`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateAgileBoard = (
  projectId: number,
  boardId: number,
  input: Partial<AgileBoard> & { member_ids?: number[] },
) =>
  apiFetch<AgileBoard>(`/tasks/projects/${projectId}/boards/${boardId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const addBoardColumn = (
  projectId: number,
  name: string,
  wip_limit: number | null,
  group_name = "",
) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/`, {
    method: "POST",
    body: JSON.stringify({ name, wip_limit, group_name }),
  });

export const updateBoardColumn = (
  projectId: number,
  columnId: number,
  input: Partial<BoardColumn> & { status_ids?: number[] },
) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/${columnId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteBoardColumn = (projectId: number, columnId: number) =>
  apiFetch<void>(`/tasks/projects/${projectId}/columns/${columnId}/`, { method: "DELETE" });
