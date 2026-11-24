import { useState } from "react";
import { dataScope } from "../../../common/api/queryApi";
import { useTasksQuery } from "../../../features/tasks/api/tasksQuery";
import { useSaveReleaseMutation } from "../../api/releases";
import type { Approver, Release, ReleaseDraft, ReleaseGoal } from "../../entities/release";
interface Props {
  release?: Release;
  members: Approver[];
  goals: ReleaseGoal[];
  onClose: () => void;
  onSaved: (release: Release) => void;
}

export function useReleaseFormModel({ release, members, goals, onClose, onSaved }: Props) {
  const [values, setValues] = useState<ReleaseDraft>(() => ({
    name: release?.name ?? "",
    description: release?.description ?? "",
    target_date: release?.target_date ?? null,
    task_ids: release?.tasks.map((task) => task.id) ?? [],
    goal_ids: release?.goals.map((goal) => goal.id) ?? [],
    steps:
      release?.steps.map((step) => ({ name: step.name, approver_id: step.approver_id ?? 0 })) ?? [],
  }));
  const [search, setSearch] = useState("");
  const [goalSearch, setGoalSearch] = useState("");
  const [error, setError] = useState("");
  const [save, saveState] = useSaveReleaseMutation();
  const tasks = useTasksQuery({ ...dataScope(), boardId: null, activeSprintOnly: false });
  const shownTasks = (tasks.currentData ?? []).filter((task) =>
    `${task.title} ${task.project_name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );
  const shownGoals = goals.filter((goal) =>
    goal.name.toLowerCase().includes(goalSearch.toLowerCase()),
  );

  function moveStep(index: number, delta: number) {
    const steps = [...values.steps];
    const [step] = steps.splice(index, 1);
    steps.splice(index + delta, 0, step);
    setValues({ ...values, steps });
  }

  function editStep(index: number, changes: Partial<ReleaseDraft["steps"][number]>) {
    setValues({
      ...values,
      steps: values.steps.map((step, position) =>
        position === index ? { ...step, ...changes } : step,
      ),
    });
  }

  async function submit() {
    if (saveState.isLoading) return;
    setError("");
    try {
      const saved = await save({ id: release?.id, values }).unwrap();
      onSaved(saved);
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not save the release.",
      );
    }
  }

  return {
    values,
    setValues,
    search,
    setSearch,
    goalSearch,
    setGoalSearch,
    error,
    saveState,
    tasks,
    shownTasks,
    shownGoals,
    moveStep,
    editStep,
    submit,
    release,
    members,
    onClose,
  };
}
