import { useState } from "react";
import type { Project } from "../../../common/entities/project";
import type { Sprint } from "../../../features/tasks/entities/task";
import { createSprint } from "../../../features/tasks/api/sprints";
import { firstValidationError, sprintSchema } from "../../../common/validation/schemas";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { useToast } from "../../../common/features/notifications/useToast";

export function useSprintCreation({
  project: newSprintProject,
  sprintError,
  setSprintError,
  onCreated,
  hasProjectSelection,
}: {
  project: Project | null;
  sprintError: string;
  setSprintError: (error: string) => void;
  onCreated: (sprint: Sprint, message: string) => void;
  hasProjectSelection: boolean;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintStart, setNewSprintStart] = useState("");
  const [newSprintEnd, setNewSprintEnd] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [newSprintCapacity, setNewSprintCapacity] = useState("");
  const [newSprintActive, setNewSprintActive] = useState(false);
  const [savingSprint, setSavingSprint] = useState(false);
  function openSprintForm() {
    setNewSprintName("");
    setNewSprintStart("");
    setNewSprintEnd("");
    setNewSprintGoal("");
    setNewSprintCapacity("");
    setNewSprintActive(false);
    setSprintError("");
    setCreateSprintOpen(true);
  }

  async function submitSprint() {
    if (!newSprintProject) {
      const message = t("sprintTrain.errorChooseProjectAndName");
      setSprintError(message);
      toast("error", message);
      return;
    }
    const validationError = firstValidationError(sprintSchema, {
      name: newSprintName,
      goal: newSprintGoal,
      startDate: newSprintStart,
      endDate: newSprintEnd,
      capacity: newSprintCapacity,
    });
    if (validationError) {
      setSprintError(validationError);
      toast("error", validationError);
      return;
    }
    const capacity = newSprintCapacity.trim() ? Number(newSprintCapacity) : null;
    setSavingSprint(true);
    setSprintError("");
    try {
      const sprint = await createSprint(
        newSprintProject.id,
        newSprintName.trim(),
        newSprintActive,
        newSprintStart,
        newSprintEnd,
        newSprintGoal.trim(),
        capacity,
      );
      setCreateSprintOpen(false);
      const message = t("sprintTrain.sprintCreatedFor", {
        sprint: sprint.name,
        project: newSprintProject.name,
      });
      onCreated(sprint, message);
      toast("success", message);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("sprintTrain.errorCreateSprint");
      setSprintError(message);
      toast("error", message);
    } finally {
      setSavingSprint(false);
    }
  }

  return {
    open: createSprintOpen,
    openForm: openSprintForm,
    props: {
      project: newSprintProject,
      hasProjectSelection,
      name: newSprintName,
      start: newSprintStart,
      end: newSprintEnd,
      goal: newSprintGoal,
      capacity: newSprintCapacity,
      active: newSprintActive,
      saving: savingSprint,
      error: sprintError,
      onName: setNewSprintName,
      onStart: setNewSprintStart,
      onEnd: setNewSprintEnd,
      onGoal: setNewSprintGoal,
      onCapacity: setNewSprintCapacity,
      onActive: setNewSprintActive,
      onClose: () => setCreateSprintOpen(false),
      onSubmit: submitSprint,
    },
  };
}
