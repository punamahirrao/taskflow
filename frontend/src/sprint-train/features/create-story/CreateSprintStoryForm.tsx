import type { Sprint } from "../../../features/tasks/entities/task";
import { SprintStoryForm } from "../../components/create-story/SprintStoryForm";
import { SprintStoryTitleField } from "../../components/create-story/SprintStoryTitleField";
import { SprintStoryDescriptionField } from "../../components/create-story/SprintStoryDescriptionField";
import { SprintStoryEstimateField } from "../../components/create-story/SprintStoryEstimateField";
import { SprintStorySubmitButton } from "../../components/create-story/SprintStorySubmitButton";
export function CreateSprintStoryForm({
  sprint,
  title,
  description,
  estimate,
  saving,
  onTitle,
  onDescription,
  onEstimate,
  onSubmit,
}: {
  sprint: Sprint;
  title: string;
  description: string;
  estimate: string;
  saving: boolean;
  onTitle: (value: string) => void;
  onDescription: (value: string) => void;
  onEstimate: (value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <SprintStoryForm sprint={sprint} onSubmit={onSubmit}>
      <SprintStoryTitleField value={title} onChange={onTitle} />
      <SprintStoryDescriptionField value={description} onChange={onDescription} />
      <SprintStoryEstimateField value={estimate} onChange={onEstimate} />
      <SprintStorySubmitButton saving={saving} hasTitle={Boolean(title.trim())} />
    </SprintStoryForm>
  );
}
