import type { Sprint } from "../../features/tasks/entities/task";
export type CapacityDraft = Record<number, { points: string; allocation: string }>;
export type ChangeCapacityDraft = (
  id: number,
  field: "points" | "allocation",
  value: string,
) => void;
export interface CapacityReportProps {
  sprint: Sprint;
  onSprintUpdated: (sprint: Sprint) => void;
  onReviewStories: () => void;
}
export interface TeamCapacityProps {
  sprints: Sprint[];
  selectedSprint: Sprint | null;
  onSelectSprint: (id: number) => void;
  onSprintUpdated: (sprint: Sprint) => void;
  onReviewStories: () => void;
}
