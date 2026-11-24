import type { ActivityItem } from "../../../dashboard/api/dashboardQueries";
import type { Task } from "../../../features/tasks/entities/task";
import { WorkActivityEmptyState } from "./WorkActivityEmptyState";
import { WorkActivityItem } from "./WorkActivityItem";
export function WorkActivityList({
  items,
  tasksById,
  onTask,
}: {
  items: ActivityItem[];
  tasksById: Map<number, Task>;
  onTask: (task: Task) => void;
}) {
  if (!items.length) return <WorkActivityEmptyState />;
  return (
    <ul className="my-work-list">
      {items.map((item) => (
        <WorkActivityItem
          key={item.id}
          item={item}
          task={tasksById.get(item.task_id)}
          onTask={onTask}
        />
      ))}
    </ul>
  );
}
