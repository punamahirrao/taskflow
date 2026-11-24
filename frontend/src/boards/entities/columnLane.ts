import type { ReactNode } from "react";
import type { BoardColumn, Task } from "../../features/tasks/entities/task";
import type { Swimlane } from "../../common/features/agile/utils/boardView";
import type { ProjectOption } from "./boards";

export interface BoardColumnLaneProps {
  groupName: string;
  columns: BoardColumn[];
  tasks: Task[];
  swimlane: Swimlane;
  projects: ProjectOption[];
  projectSelected: boolean;
  canCustomize: boolean;
  busy: boolean;
  overLimit: boolean;
  aggregateLimit: number;
  onSaveLimit: (column: BoardColumn, value: string) => void;
  onMove: (taskId: number, status: string) => void;
  renderTask: (task: Task) => ReactNode;
}
