import { useState } from "react";
import type { Project } from "../../../common/entities/project";
import { useToast } from "../../../common/features/notifications/useToast";
import { useDialogBehavior } from "../../../common/shared/hooks/useDialogBehavior";
import type { Task } from "../../../features/tasks/entities/task";
import { createsCycle } from "../../../features/tasks/utils/dependencies";
import { useSaveDependenciesMutation } from "../../api/dependenciesQuery";
interface DependencyFormProps {
  tasks: Task[];
  editableProjects: Project[];
  selectedProjectId: number | null;
  onClose: () => void;
}
export function useDependencyFormModel({
  tasks,
  editableProjects,
  selectedProjectId,
  onClose,
}: DependencyFormProps) {
  const [projectId, setProjectId] = useState(selectedProjectId ?? editableProjects[0]?.id ?? null);
  const [taskId, setTaskId] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [save, { isLoading }] = useSaveDependenciesMutation();
  const toast = useToast();
  useDialogBehavior(onClose, isLoading);

  const task = tasks.find((item) => item.id === Number(taskId));
  const workItems = tasks.filter((item) => item.project === projectId);
  const candidates = tasks.filter(
    (item) =>
      item.id !== task?.id &&
      `NEX-${item.id} ${item.title} ${item.project_name ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  async function submit() {
    setError("");
    if (!task || !editableProjects.some((project) => project.id === task.project)) {
      setError("Choose a work item in a project you can edit.");
      return;
    }
    const ids = [...new Set([...task.blocked_by, ...selectedIds])];
    if (!selectedIds.length || ids.length === task.blocked_by.length) {
      setError("Choose at least one new prerequisite.");
      return;
    }
    if (createsCycle(tasks, task.id, ids)) {
      setError("These links would create a circular dependency.");
      return;
    }
    try {
      await save({ taskId: task.id, blockedBy: ids }).unwrap();
      toast("success", selectedIds.length === 1 ? "Dependency created." : "Dependencies created.");
      onClose();
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not create this dependency.",
      );
    }
  }

  return {
    projectId,
    setProjectId,
    taskId,
    setTaskId,
    selectedIds,
    setSelectedIds,
    search,
    setSearch,
    error,
    setError,
    isLoading,
    task,
    workItems,
    candidates,
    submit,
    tasks,
    editableProjects,
    onClose,
  };
}
