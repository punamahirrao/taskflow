import type { AgileBoard } from "../../features/tasks/entities/task";
import type { Project } from "../../common/entities/project";
export interface BoardCardProps {
  board: AgileBoard;
  project?: Project;
  canManage: boolean;
  menuOpen: boolean;
  onOpen: () => void;
  onMenu: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onProjectSettings: () => void;
}
