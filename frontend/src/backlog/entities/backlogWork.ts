import type { Project } from "../../common/entities/project";
import type { Sprint, Task } from "../../features/tasks/entities/task";
import type { EpicRollup } from "./backlog";
import type { groupBacklogTasks } from "../features/agile/utils/backlog";

type Group = ReturnType<typeof groupBacklogTasks>[number];
export interface BacklogWorkListProps {
  loading: boolean;
  backlog: Task[];
  tasks: Task[];
  projects: Project[];
  groups: Group[];
  activeSprint?: Sprint;
  sprintBusy: boolean;
  epicRollups: Map<number, EpicRollup>;
  onCapture: () => void;
  onReorder: (taskIds: number[]) => void;
  reordering?: boolean;
  onUpdate: (taskId: number, changes: Partial<Task>) => Promise<unknown>;
  onEdit: (taskId: number) => void;
}

export interface BacklogWorkItemProps extends Omit<
  BacklogWorkListProps,
  "loading" | "groups" | "epicRollups" | "onCapture"
> {
  task: Task;
  rollup?: EpicRollup;
}
