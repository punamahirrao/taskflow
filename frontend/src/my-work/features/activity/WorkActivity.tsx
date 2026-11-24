import type { DataScope } from "../../../common/api/queryApi";
import type { Task } from "../../../features/tasks/entities/task";
import { useActivityQuery } from "../../../dashboard/api/dashboardQueries";
import { WorkActivityPanel } from "../../components/activity/WorkActivityPanel";
import { WorkActivityHeader } from "../../components/activity/WorkActivityHeader";
import { WorkActivityError } from "../../components/activity/WorkActivityError";
import { WorkActivityLoading } from "../../components/activity/WorkActivityLoading";
import { WorkActivityList } from "../../components/activity/WorkActivityList";

export function WorkActivity({
  scope,
  tasks,
  full,
  onView,
  onTask,
}: {
  scope: DataScope;
  tasks: Task[];
  full?: boolean;
  onView: () => void;
  onTask: (task: Task) => void;
}) {
  const { currentData, isFetching, error } = useActivityQuery({ ...scope, mine: true });
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const items = currentData?.filter((item) => byId.has(item.task_id)) ?? [];
  const visibleItems = items.slice(0, full ? items.length : 4);
  return (
    <WorkActivityPanel>
      <WorkActivityHeader full={full} onView={onView} />
      {error ? (
        <WorkActivityError />
      ) : isFetching && !currentData ? (
        <WorkActivityLoading />
      ) : (
        <WorkActivityList items={visibleItems} tasksById={byId} onTask={onTask} />
      )}
    </WorkActivityPanel>
  );
}
