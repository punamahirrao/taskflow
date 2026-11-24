import type { Task } from "../../features/tasks/entities/task";

export interface SprintStoryDetailsDrawerProps {
  task: Task;
  onClose: () => void;
  projectName?: string;
  onUpdate: (changes: Partial<Task>) => void;
  backlogDrawerOpen?: boolean;
  drawerClassName?: string;
  open?: boolean;
}

export type DrawerTab = "details" | "comments" | "history";
