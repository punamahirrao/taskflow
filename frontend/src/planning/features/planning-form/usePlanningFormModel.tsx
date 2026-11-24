import { useState } from "react";
import { dataScope } from "../../../common/api/queryApi";
import { useToast } from "../../../common/features/notifications/useToast";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useDialogBehavior } from "../../../common/shared/hooks/useDialogBehavior";
import { useTasksQuery } from "../../../features/tasks/api/tasksQuery";
import { useSavePlanningMutation } from "../../api/planningQuery";
import type { PlanningRecord } from "../../entities/planning";
const EMPTY: Omit<PlanningRecord, "id"> = {
  kind: "goal",
  name: "",
  description: "",
  status: "planned",
  target_date: null,
  tasks: [],
};
export function usePlanningFormModel({
  kind,
  item,
  onClose,
}: {
  kind: PlanningRecord["kind"];
  item?: PlanningRecord;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Omit<PlanningRecord, "id">>(item ?? { ...EMPTY, kind });
  const [save, { isLoading }] = useSavePlanningMutation();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { projects, selectedId } = useProjectContext();
  const [projectId, setProjectId] = useState<number | null>(selectedId);
  const toast = useToast();
  const {
    currentData: tasks = [],
    isFetching: tasksLoading,
    error: tasksError,
    refetch,
  } = useTasksQuery({
    ...dataScope(),
    activeSprintOnly: false,
    boardId: null,
  });
  const visibleTasks = tasks.filter(
    (task) =>
      (!projectId || task.project === projectId) &&
      `NEX-${task.id} ${task.title} ${task.project_name ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  useDialogBehavior(onClose, isLoading);
  async function submit() {
    setError("");
    if (!values.name.trim()) {
      setError(`Enter a ${kind} name.`);
      return;
    }
    try {
      await save({
        id: item?.id,
        values: { ...values, name: values.name.trim(), description: values.description.trim() },
      }).unwrap();
      toast(
        "success",
        `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${item ? "updated" : "created"}.`,
      );
      onClose();
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not save this record.",
      );
    }
  }

  return {
    values,
    setValues,
    isLoading,
    error,
    search,
    setSearch,
    projects,
    projectId,
    setProjectId,
    tasks,
    tasksLoading,
    tasksError,
    refetch,
    visibleTasks,
    submit,
    kind,
    item,
    onClose,
  };
}
