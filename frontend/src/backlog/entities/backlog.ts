import type { Task } from "../../features/tasks/entities/task";

export interface Suggestion {
  task: Task;
  priority: Task["priority"];
  reason: string;
}

export interface EpicRollup {
  done: number;
  total: number;
}

export interface ProjectOption {
  id: number;
  name: string;
}

export interface BacklogGroup {
  name: string;
  tasks: Task[];
}
