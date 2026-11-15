import type { Project } from "../../common/entities/project";
import type { AgileBoard } from "../../common/entities/task";

export type BoardSortKey = "updated" | "name" | "tasks" | "sprints";
export type BoardTab = "all" | "mine" | "archived";
interface FilterBoardsOptions { boards: AgileBoard[]; archivedBoards: AgileBoard[]; projects: Project[]; userId?: number; tab: BoardTab; selectedId: number | null; typeFilter: string; search: string; sort: BoardSortKey }
export function filterAndSortBoards({ boards, archivedBoards, projects, userId, tab, selectedId, typeFilter, search, sort }: FilterBoardsOptions) {
  const query = search.trim().toLowerCase();
  return (tab === "archived" ? archivedBoards : boards).filter((board) => {
    const project = projects.find((item) => item.id === board.project);
    if (tab === "mine" && board.owner !== userId && !board.members.some((member) => member.id === userId)) return false;
    if (selectedId !== null && board.project !== selectedId) return false;
    if (typeFilter !== "all" && board.board_type !== typeFilter) return false;
    return `${board.name} ${board.description} ${project?.name ?? ""}`.toLowerCase().includes(query);
  }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "tasks" ? b.task_count - a.task_count : sort === "sprints" ? b.sprint_count - a.sprint_count : b.updated_at.localeCompare(a.updated_at));
}
