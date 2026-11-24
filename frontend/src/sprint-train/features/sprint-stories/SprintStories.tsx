import type { SprintStoriesProps } from "../../entities/workflow";
import { WorkItemCard } from "../../../features/tasks/components/WorkItemCard";
import { points } from "../../utils/sprintTrain";
import { SprintPlanningDetails } from "../sprint-planning/SprintPlanningDetails";
import { SprintStoriesPanel } from "../../components/sprint-stories/SprintStoriesPanel";
import { SprintStoriesHeader } from "../../components/sprint-stories/SprintStoriesHeader";
import { SprintStoriesList } from "../../components/sprint-stories/SprintStoriesList";
import { SprintStoryDragRow } from "../../components/sprint-stories/SprintStoryDragRow";
import { SprintStoriesEmptyState } from "../../components/sprint-stories/SprintStoriesEmptyState";
export function SprintStories({
  selectedSprint,
  sprintTasks,
  filteredTasks,
  tasks,
  projects,
  onAssignStory,
  onReorder,
  onUpdate,
  onSelectStory,
  onSprintSaved,
}: SprintStoriesProps) {
  const totalPoints = sprintTasks.reduce((total, task) => total + points(task), 0);
  const canEdit = selectedSprint
    ? (selectedSprint.can_manage ??
      ["owner", "admin"].includes(
        projects.find((project) => project.id === selectedSprint.project)?.my_role ?? "",
      ))
    : false;
  function dropStory(sourceId: number, targetId?: number) {
    if (targetId !== undefined && sprintTasks.some((task) => task.id === sourceId))
      onReorder(sourceId, targetId);
    else if (selectedSprint) void onAssignStory(sourceId, selectedSprint);
  }
  return (
    <SprintStoriesPanel onDropStory={dropStory}>
      <SprintStoriesHeader sprint={selectedSprint} totalPoints={totalPoints}>
        {selectedSprint && (
          <SprintPlanningDetails
            key={selectedSprint.id}
            sprint={selectedSprint}
            canEdit={canEdit}
            onSaved={onSprintSaved}
          />
        )}
      </SprintStoriesHeader>
      <SprintStoriesList>
        {filteredTasks.map((task) => (
          <SprintStoryDragRow key={task.id} taskId={task.id} onDropStory={dropStory}>
            <WorkItemCard
              compact
              task={task}
              headingLevel={3}
              candidates={tasks}
              members={projects.find((project) => project.id === task.project)?.members ?? []}
              onAssign={(userId) => void onUpdate(task.id, { assignee: userId })}
              sprintAction="backlog"
              onSprintAction={() => void onUpdate(task.id, { status: "backlog", sprint: null })}
              onEdit={() => onSelectStory(task.id)}
            />
          </SprintStoryDragRow>
        ))}
        {!filteredTasks.length && <SprintStoriesEmptyState hasSprint={Boolean(selectedSprint)} />}
      </SprintStoriesList>
    </SprintStoriesPanel>
  );
}
