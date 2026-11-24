import type { BoardColumn, Task } from "../../features/tasks/entities/task";
import type { Project } from "../../common/entities/project";
import type { Swimlane } from "../../common/features/agile/utils/boardView";
import type { BoardColumnGroup } from "./boards";

export interface BoardWorkflowProps {
  message: string;
  error: string;
  blockedCount: number;
  loading: boolean;
  columns: BoardColumnGroup[];
  tasks: Task[];
  projectColumns: Record<number, BoardColumn[]>;
  visibleProjects: Project[];
  projects: Project[];
  projectSelected: boolean;
  swimlane: Swimlane;
  onMove: (taskId: number, status: string) => void;
  onOpenTask: (taskId: number) => void;
}
