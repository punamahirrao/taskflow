export type TaskComment = {
  id: number;
  task: number;
  author_id: number | null;
  author_name: string;
  author_photo_url: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  can_delete: boolean;
};

export type TaskHistoryEntry = {
  id: number;
  actor_name: string;
  action: "created" | "updated" | "comment_added" | "comment_edited" | "comment_deleted" | string;
  changes: Record<string, { old?: unknown; new?: unknown }>;
  created_at: string;
};
