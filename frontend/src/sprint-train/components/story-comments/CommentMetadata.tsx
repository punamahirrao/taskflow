import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TaskComment } from "../../../features/tasks/entities/taskActivity";

export function CommentMetadata({ comment }: { comment: TaskComment }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{comment.author_name}</p>
      <time className="text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-400">
        {new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(comment.created_at))}
        {comment.updated_at !== comment.created_at && t("sprintTrain.edited")}
      </time>
    </div>
  );
}
