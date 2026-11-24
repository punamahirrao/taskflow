import type { AgileBoard } from "../../features/tasks/entities/task";
import type { Swimlane } from "../../common/features/agile/utils/boardView";
export interface BoardWorkspaceHeaderProps {
  name?: string;
  projectBoards: AgileBoard[];
  selectedBoardId?: number;
  canManage: boolean;
  swimlane: Swimlane;
  sprintMode: boolean;
  usesSprints: boolean;
  onBack: () => void;
  onBoardChange: (value: string) => void;
  onConfigure: () => void;
  onSwimlane: (value: Swimlane) => void;
  onToggleSprintMode: () => void;
  onRefresh: () => void;
}
