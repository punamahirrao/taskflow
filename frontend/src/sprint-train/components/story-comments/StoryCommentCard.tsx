import type { TaskComment } from "../../../features/tasks/entities/taskActivity";
import { CommentAuthorAvatar } from "./CommentAuthorAvatar";
import { CommentMetadata } from "./CommentMetadata";
import { CommentActions } from "./CommentActions";
import { CommentEditor } from "./CommentEditor";

export function StoryCommentCard({
  comment,
  editing,
  text,
  saving,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onText,
}: {
  comment: TaskComment;
  editing: boolean;
  text: string;
  saving: boolean;
  onEdit: (comment: TaskComment) => void;
  onDelete: (comment: TaskComment) => Promise<void>;
  onSave: (comment: TaskComment) => Promise<void>;
  onCancel: () => void;
  onText: (text: string) => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <header className="flex items-start gap-3">
        <CommentAuthorAvatar comment={comment} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CommentMetadata comment={comment} />
            <CommentActions comment={comment} onEdit={onEdit} onDelete={onDelete} />
          </div>
          {editing ? (
            <CommentEditor
              text={text}
              saving={saving}
              onText={onText}
              onCancel={onCancel}
              onSave={() => onSave(comment)}
            />
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {comment.content}
            </p>
          )}
        </div>
      </header>
    </article>
  );
}
