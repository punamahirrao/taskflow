import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import type { ReadyCheck } from "../../entities/sprintTrain";
import { StoryDetailsFieldsLayout } from "../../components/story-details/StoryDetailsFieldsLayout";
import { StoryDescriptionField } from "../../components/story-details/StoryDescriptionField";
import { StoryProjectField } from "../../components/story-details/StoryProjectField";
import { StorySprintField } from "../../components/story-details/StorySprintField";
import { StoryAssigneeField } from "../../components/story-details/StoryAssigneeField";
import { StoryEstimateField } from "../../components/story-details/StoryEstimateField";
import { StoryDueDateField } from "../../components/story-details/StoryDueDateField";
import { StoryTagsField } from "../../components/story-details/StoryTagsField";
import { StoryReadinessField } from "../../components/story-details/StoryReadinessField";
import { StoryDependenciesField } from "../../components/story-details/StoryDependenciesField";

export function StoryDetails({
  task,
  projectName,
  onUpdate,
  readyChecks,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "projectName" | "onUpdate"> & {
  readyChecks: ReadyCheck[];
}) {
  return (
    <StoryDetailsFieldsLayout>
      <StoryDescriptionField task={task} onUpdate={onUpdate} />
      <StoryProjectField task={task} projectName={projectName} />
      <StorySprintField task={task} />
      <StoryAssigneeField task={task} />
      <StoryEstimateField task={task} onUpdate={onUpdate} />
      <StoryDueDateField task={task} onUpdate={onUpdate} />
      <StoryTagsField task={task} onUpdate={onUpdate} />
      <StoryReadinessField readyChecks={readyChecks} />
      {task.blocked_by.length > 0 && <StoryDependenciesField task={task} />}
    </StoryDetailsFieldsLayout>
  );
}
