import type { TaskComment } from "../../features/tasks/entities/taskActivity";
export interface StoryCommentsProps {
  comments: TaskComment[];
  loading: boolean;
  editingId: number | null;
  editingText: string;
  saving: boolean;
  newComment: string;
  onEdit: (comment: TaskComment) => void;
  onDelete: (comment: TaskComment) => Promise<void>;
  onSave: (comment: TaskComment) => Promise<void>;
  onCancelEdit: () => void;
  onEditingText: (text: string) => void;
  onNewComment: (text: string) => void;
  onSubmit: () => Promise<void>;
}
