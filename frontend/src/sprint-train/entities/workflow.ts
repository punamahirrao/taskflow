import type { Project } from "../../common/entities/project";
import type { Sprint, Task } from "../../features/tasks/entities/task";
export type AssignSprintStory = (taskId: number, sprint: Sprint) => Promise<void>;
export interface SprintPipelineProps {
  sprints: Sprint[];
  tasks: Task[];
  projects: Project[];
  selectedSprintId?: number;
  showProjectNames: boolean;
  loading: boolean;
  onSelect: (id: number) => void;
  onAssignStory: AssignSprintStory;
}
export interface SprintStoriesProps {
  selectedSprint: Sprint | null;
  sprintTasks: Task[];
  filteredTasks: Task[];
  tasks: Task[];
  projects: Project[];
  onAssignStory: AssignSprintStory;
  onReorder: (taskId: number, targetId: number) => void;
  onUpdate: (taskId: number, changes: Partial<Task>) => Promise<unknown>;
  onSelectStory: (id: number) => void;
  onSprintSaved: (sprint: Sprint) => void;
}
