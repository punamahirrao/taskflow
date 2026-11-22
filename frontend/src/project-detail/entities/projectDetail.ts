import type { TranslationKey } from "../../common/entities/language";
import type { TaskStatus } from "../../features/tasks/entities/task";

export type ProjectTab = "overview" | "tasks" | "timeline" | "files";

export interface ProjectTabItem {
  key: ProjectTab;
  label: TranslationKey;
}

export interface ProjectMilestone {
  status: TaskStatus;
  title: TranslationKey;
  iconClass: string;
  barClass: string;
}
