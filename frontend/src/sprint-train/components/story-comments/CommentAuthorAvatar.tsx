import type { TaskComment } from "../../../features/tasks/entities/taskActivity";

export function CommentAuthorAvatar({ comment }: { comment: TaskComment }) {
  return (
    <>
      {comment.author_photo_url ? (
        <img src={comment.author_photo_url} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
          {comment.author_name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </span>
      )}
    </>
  );
}
