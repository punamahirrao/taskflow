import type { ActivityItem } from "../../../dashboard/api/dashboardQueries";
import type { Task } from "../../../features/tasks/entities/task";
export function WorkActivityItem({
  item,
  task,
  onTask,
}: {
  item: ActivityItem;
  task?: Task;
  onTask: (task: Task) => void;
}) {
  return (
    <li>
      <span className="my-work-avatar" aria-hidden="true">
        {item.actor
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")}
      </span>
      <button
        type="button"
        className="my-work-item-link"
        onClick={() => {
          if (task) onTask(task);
        }}
      >
        {item.title}
        <small>
          {item.actor} · {item.action.replaceAll("_", " ")}
        </small>
      </button>
      <time dateTime={item.created_at}>
        {new Date(item.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}
      </time>
    </li>
  );
}
