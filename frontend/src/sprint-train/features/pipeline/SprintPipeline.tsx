import type { SprintPipelineProps } from "../../entities/workflow";
import { points } from "../../utils/sprintTrain";
import { SprintPipelineSection } from "../../components/pipeline/SprintPipelineSection";
import { SprintPipelineTrack } from "../../components/pipeline/SprintPipelineTrack";
import { SprintPipelineCardFrame } from "../../components/pipeline/SprintPipelineCardFrame";
import { SprintPipelineCardHeading } from "../../components/pipeline/SprintPipelineCardHeading";
import { SprintPipelineCardDates } from "../../components/pipeline/SprintPipelineCardDates";
import { SprintPipelineCardStats } from "../../components/pipeline/SprintPipelineCardStats";
import { SprintPipelineEmptyState } from "../../components/pipeline/SprintPipelineEmptyState";
export function SprintPipeline({
  sprints,
  tasks,
  projects,
  selectedSprintId,
  showProjectNames,
  loading,
  onSelect,
  onAssignStory,
}: SprintPipelineProps) {
  const cards = sprints.map((sprint) => {
    const assigned = tasks.filter((task) => task.sprint === sprint.id && task.status !== "backlog");
    return {
      sprint,
      storyCount: assigned.length,
      totalPoints: assigned.reduce((total, task) => total + points(task), 0),
      projectName: projects.find((project) => project.id === sprint.project)?.name,
    };
  });
  return (
    <SprintPipelineSection>
      <SprintPipelineTrack count={cards.length}>
        {cards.map(({ sprint, storyCount, totalPoints, projectName }) => (
          <SprintPipelineCardFrame
            key={sprint.id}
            selected={sprint.id === selectedSprintId}
            onSelect={() => onSelect(sprint.id)}
            onDropStory={(id) => void onAssignStory(id, sprint)}
          >
            <SprintPipelineCardHeading
              sprint={sprint}
              sprintProjectName={projectName}
              showProjectName={showProjectNames}
            />
            <SprintPipelineCardDates sprint={sprint} />
            <SprintPipelineCardStats
              sprint={sprint}
              storyCount={storyCount}
              totalPoints={totalPoints}
            />
          </SprintPipelineCardFrame>
        ))}
      </SprintPipelineTrack>
      {!cards.length && <SprintPipelineEmptyState loading={loading} />}
    </SprintPipelineSection>
  );
}
