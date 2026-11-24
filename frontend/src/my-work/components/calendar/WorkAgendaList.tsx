import type { Task } from "../../../features/tasks/entities/task";
import { WorkAgendaEmptyState } from "./WorkAgendaEmptyState";
import { WorkAgendaItem } from "./WorkAgendaItem";
export function WorkAgendaList({
  tasks,
  full,
  onTask,
}: {
  tasks: Task[];
  full?: boolean;
  onTask: (task: Task) => void;
}) {
  if (!tasks.length) return <WorkAgendaEmptyState full={full} />;
  return (
    <ul className="my-work-list">
      {tasks.map((task) => (
        <WorkAgendaItem key={task.id} task={task} onTask={onTask} />
      ))}
    </ul>
  );
}
