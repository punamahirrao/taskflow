export interface PlanningRecord {
  id: number;
  kind: "release" | "goal" | "milestone" | "template";
  name: string;
  description: string;
  status: "planned" | "in_progress" | "done";
  target_date: string | null;
  tasks: number[];
  related_releases?: { id: number; name: string }[];
}
