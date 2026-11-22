export type ReleaseState = "planned" | "in_progress" | "changes_requested" | "ready" | "done";
export type ApprovalState = "pending" | "in_progress" | "changes_requested" | "approved";

export interface ReleaseGoal {
  id: number;
  name: string;
  status: string;
}
export interface Approver {
  id: number;
  name: string;
}
export interface ApprovalStep {
  id: number;
  name: string;
  approver_id: number | null;
  approver_name: string | null;
  status: ApprovalState;
  note: string;
  decided_at: string | null;
  can_decide: boolean;
}

export interface Release {
  id: number;
  name: string;
  description: string;
  target_date: string | null;
  state: ReleaseState;
  active_step_id: number | null;
  goals: ReleaseGoal[];
  tasks: { id: number; title: string; status: string; project_id: number; project_name: string }[];
  steps: ApprovalStep[];
}

export interface ReleaseDraft {
  name: string;
  description: string;
  target_date: string | null;
  task_ids: number[];
  goal_ids: number[];
  steps: { name: string; approver_id: number }[];
}

export type ReleaseAction =
  | { action: "start" | "finish" }
  | { action: "resume"; step_id: number }
  | { action: "approve" | "request_changes"; step_id: number; note: string }
  | { action: "reassign"; step_id: number; approver_id: number };

export interface ReleaseDirectory {
  items: Release[];
  can_manage: boolean;
  members: Approver[];
  goals: ReleaseGoal[];
}
