import type { Project } from "../../common/entities/project";
import type { Task } from "../../features/tasks/entities/task";
import type { WorkFilter } from "./work";
export interface WorkTaskRowData {
  task: Task;
  project?: Project;
  canEdit: boolean;
}
export interface WorkTasksProps {
  tasks: Task[];
  grouped: Record<WorkFilter, Task[]>;
  filter: WorkFilter;
  search: string;
  projectsById: Map<number, Project>;
  savingId: number | null;
  today: string;
  canCreate: boolean;
  needsProject: boolean;
  overview?: boolean;
  onFilterChange: (filter: WorkFilter) => void;
  onSearchChange: (search: string) => void;
  onCreate: () => void;
  onTask: (task: Task) => void;
  onComplete: (task: Task) => Promise<void>;
  onView: () => void;
}
