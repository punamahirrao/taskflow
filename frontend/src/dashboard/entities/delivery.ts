export interface DeliveryProject {
  id: number;
  name: string;
  status: "in_progress" | "upcoming" | "archived";
  end_date: string | null;
  total: number;
  done: number;
  in_review: number;
  overdue: number;
  blocked: number;
  due_soon: number;
  at_risk: number;
}

export type AttentionKind = "overdue" | "blocked" | "due_soon";

export interface AttentionItem {
  id: number;
  title: string;
  project_id: number;
  project_name: string;
  due_date: string | null;
  priority: string;
  assignee: string | null;
}

export interface DeliverySnapshot {
  as_of: string;
  projects: DeliveryProject[];
  trend: { date: string; created: number; completed: number }[];
  attention: Record<AttentionKind, AttentionItem[]>;
  sprint_count: number;
  sprints: {
    id: number;
    name: string;
    project_id: number;
    project__name: string;
    end_date: string | null;
    goal: string;
    total: number;
    done: number;
  }[];
  milestones: {
    id: number;
    name: string;
    kind: "release" | "goal" | "milestone";
    target_date: string;
  }[];
}
