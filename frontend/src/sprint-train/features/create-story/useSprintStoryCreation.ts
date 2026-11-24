import { useState } from "react";
import type { Sprint, Task } from "../../../features/tasks/entities/task";
import { createTask } from "../../../features/tasks/api/tasks";
import { firstValidationError, taskSchema } from "../../../common/validation/schemas";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { useToast } from "../../../common/features/notifications/useToast";

export function useSprintStoryCreation({
  selectedSprint,
  storyCount,
  onCreated,
  setFeedback,
}: {
  selectedSprint: Sprint | null;
  storyCount: number;
  onCreated: (task: Task) => void;
  setFeedback: (message: string) => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDescription, setNewStoryDescription] = useState("");
  const [newStoryEstimate, setNewStoryEstimate] = useState("");
  const [savingStory, setSavingStory] = useState(false);
  async function submitStory() {
    const validationError = firstValidationError(taskSchema, {
      title: newStoryTitle,
      description: newStoryDescription,
    });
    if (!selectedSprint || validationError) {
      const message = !selectedSprint
        ? t("sprintTrain.errorSelectSprintAndTitle")
        : validationError!;
      setFeedback(message);
      toast("error", message);
      return;
    }
    setSavingStory(true);
    setFeedback("");
    try {
      const story = await createTask({
        project_id: selectedSprint.project,
        title: newStoryTitle.trim(),
        description: newStoryDescription.trim(),
        status: "todo",
        work_type: "task",
        priority: "medium",
        estimate: newStoryEstimate.trim(),
        tags: [],
        rank: storyCount,
        blocked: false,
        ready_for_sprint: false,
        assignee: null,
        sprint: selectedSprint.id,
        parent: null,
      });
      onCreated(story);
      setNewStoryTitle("");
      setNewStoryDescription("");
      setNewStoryEstimate("");
      setCreateStoryOpen(false);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("sprintTrain.errorCreateStory");
      setFeedback(message);
      toast("error", message);
    } finally {
      setSavingStory(false);
    }
  }

  return {
    open: createStoryOpen,
    setOpen: setCreateStoryOpen,
    props: {
      newStoryTitle,
      newStoryDescription,
      newStoryEstimate,
      savingStory,
      onSubmitStory: submitStory,
      onStoryTitleChange: setNewStoryTitle,
      onStoryDescriptionChange: setNewStoryDescription,
      onStoryEstimateChange: setNewStoryEstimate,
    },
  };
}
