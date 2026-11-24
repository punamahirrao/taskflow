import type { AgileBoard } from "../../features/tasks/entities/task";
import type { Project } from "../../common/entities/project";
import type { BoardTab } from "../utils/boardDashboard";
export interface BoardDirectoryProps {
  boards: AgileBoard[];
  projects: Project[];
  userId?: number;
  menuId: number | null;
  canCreate: boolean;
  tab: BoardTab;
  loading: boolean;
  onOpen: (board: AgileBoard) => void;
  onMenu: (id: number) => void;
  onEdit: (board: AgileBoard) => void;
  onArchive: (board: AgileBoard) => void;
  onProjectSettings: (board: AgileBoard) => void;
  onCreate: () => void;
}
