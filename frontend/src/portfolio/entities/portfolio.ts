import type { Task } from "../../common/entities/task";

export interface CrossProjectDependency {
  task: Task;
  dependency: Task;
}

export interface BurnupSeries {
  scope: string;
  done: string;
}
