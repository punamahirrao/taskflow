import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TaskComment } from "../../../features/tasks/entities/taskActivity";
import { Pencil, Trash2 } from "lucide-react";

export function CommentActions({
  comment,
  onEdit,
  onDelete,
}: {
  comment: TaskComment;
  onEdit: (comment: TaskComment) => void;
  onDelete: (comment: TaskComment) => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <>
      {(comment.can_edit || comment.can_delete) && (
        <div className="flex items-center gap-1">
          {comment.can_edit && (
            <button
              type="button"
              aria-label={t("sprintTrain.editComment")}
              title={t("sprintTrain.editComment")}
              onClick={() => {
                onEdit(comment);
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Pencil size={14} />
            </button>
          )}
          {comment.can_delete && (
            <button
              type="button"
              aria-label={t("sprintTrain.deleteComment")}
              title={t("sprintTrain.deleteComment")}
              onClick={() => {
                if (window.confirm(t("sprintTrain.confirmDeleteComment"))) void onDelete(comment);
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
