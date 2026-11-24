import { WorkItemCard } from "../../../features/tasks/components/WorkItemCard";
import { BacklogDraggableItem } from "../../components/work-list/BacklogDraggableItem";
import type { BacklogWorkItemProps } from "../../entities/backlogWork";
import { getDefinitionOfReady } from "../agile/utils/backlog";
import { reorderBacklogItems } from "../../utils/reorderBacklogItems";

export function BacklogWorkItem({
  task,
  backlog,
  tasks,
  projects,
  activeSprint,
  sprintBusy,
  rollup,
  onReorder,
  reordering,
  onUpdate,
  onEdit,
}: BacklogWorkItemProps) {
  const members = projects.find((project) => project.id === task.project)?.members ?? [];
  const readiness = getDefinitionOfReady(task, tasks);
  function move(sourceId: number) {
    const ids = reorderBacklogItems(backlog, sourceId, task);
    if (ids) onReorder(ids);
  }
  return (
    <BacklogDraggableItem taskId={task.id} reordering={reordering} onMove={move}>
      <WorkItemCard
        task={task}
        candidates={tasks}
        members={members}
        onAssign={(userId) => void onUpdate(task.id, { assignee: userId })}
        onEscalate={() => void onUpdate(task.id, { escalated: true })}
        readiness={readiness}
        rollup={rollup}
        sprintAction="plan"
        sprintActionDisabled={!activeSprint || sprintBusy}
        onSprintAction={() => {
          if (activeSprint) void onUpdate(task.id, { status: "todo", sprint: activeSprint.id });
        }}
        onEdit={() => onEdit(task.id)}
      />
    </BacklogDraggableItem>
  );
}
