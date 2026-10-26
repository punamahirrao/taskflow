export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  project: number;
  created_by?: number;
  updated_at?: string;
};
