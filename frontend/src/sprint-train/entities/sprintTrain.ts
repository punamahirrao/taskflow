import type { TranslationKey } from "../../common/entities/language";

export type WorkflowTab = "workflow" | "capacity" | "dependencies";
export type SprintFilter = "all" | "active" | "future";

export interface WorkflowTabOption {
  id: WorkflowTab;
  label: string;
}

export interface ReadyCheck {
  labelKey: TranslationKey;
  ready: boolean;
}
