export type TaskStatus =
  "backlog" | "todo" | "in_progress" | "review" | "waiting" | "done" | (string & {});
export type WorkType =
  "task" | "story" | "idea" | "enhancement" | "bug" | "spike" | "research" | "epic" | "initiative";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export interface DoneCheck {
  key: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  project: number;
  project_name?: string;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  work_type: WorkType;
  priority: TaskPriority;
  estimate: string;
  tags: string[];
  rank: number;
  due_date?: string | null;
  planned_start_date?: string | null;
  roadmap_color?: string;
  story_ids?: number[];
  linked_stories?: { id: number; title: string; status: TaskStatus }[];
  story_progress?: { total: number; completed: number; percent: number };
  blocked: boolean;
  blocked_since: string | null;
  escalated: boolean;
  blocked_by: number[];
  related_tasks?: number[];
  definition_done: DoneCheck[];
  parent: number | null;
  parent_title: string | null;
  ready_for_sprint: boolean;
  is_wishlisted?: boolean;
  assignee: number | null;
  assignee_name: string;
  assignee_photo_url: string | null;
  sprint: number | null;
  sprint_name: string | null;
  sprint_goal: string | null;
}

export interface TaskCreateInput extends Partial<Task> {
  project_id: number;
  title: string;
}

export interface BoardColumn {
  id: number;
  name: string;
  key: string;
  position: number;
  status_order: number;
  group_name: string;
  wip_limit: number | null;
  statuses: WorkflowStatus[];
}

export interface WorkflowStatus {
  id: number;
  key: string;
  name: string;
  position: number;
  is_system: boolean;
}

export interface ProjectWorkflow {
  statuses: WorkflowStatus[];
  columns: BoardColumn[];
  can_manage: boolean;
}

export type AgileBoardType = "scrum" | "kanban";
export interface AgileBoard {
  id: number;
  project: number;
  name: string;
  description: string;
  board_type: AgileBoardType;
  owner: number;
  owner_name: string;
  members: { id: number; name: string; photo_url: string | null }[];
  member_count: number;
  task_count: number;
  sprint_count: number;
  is_archived: boolean;
  can_manage: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: number;
  project: number;
  board: number | null;
  name: string;
  can_manage?: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_closed: boolean;
  goal: string;
  capacity_points: number | null;
  velocity_points: number | null;
  outcome_summary: string;
  retrospective: string;
  created_at: string;
}

export interface SprintCloseResult {
  sprint: Sprint;
  next_sprint: Sprint | null;
  moved_count: number;
  message: string;
}

export interface StatusOption {
  key: TaskStatus;
  name: string;
}

export interface WorkItemRollup {
  done: number;
  total: number;
}

export interface WorkItemReadiness {
  ready: number;
  total: number;
}

export interface BoardTaskGroup {
  name: string;
  tasks: Task[];
}
