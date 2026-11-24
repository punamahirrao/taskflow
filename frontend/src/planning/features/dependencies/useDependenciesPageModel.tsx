import { useState } from "react";
import { useToast } from "../../../common/features/notifications/useToast";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import type { Task } from "../../../features/tasks/entities/task";
import { useAgileTasks } from "../../../features/tasks/hooks/useAgileTasks";
import { useSaveDependenciesMutation } from "../../api/dependenciesQuery";

export function useDependenciesPageModel() {
  const { projects, selectedId, error: projectsError } = useProjectContext();
  const { tasks, loading, error } = useAgileTasks(null);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [save, { isLoading: saving }] = useSaveDependenciesMutation();
  const toast = useToast();
  const editableProjects = projects.filter(
    (project) =>
      ["owner", "admin", "member"].includes(project.my_role ?? "") &&
      (!selectedId || project.id === selectedId),
  );
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const items = tasks.filter(
    (task) =>
      (!selectedId || task.project === selectedId) &&
      (task.blocked_by.length || task.related_tasks?.length),
  );
  async function removeDependency(task: Task, prerequisiteId: number) {
    setActionError("");
    try {
      await save({
        taskId: task.id,
        blockedBy: task.blocked_by.filter((id) => id !== prerequisiteId),
      }).unwrap();
      toast("success", "Dependency removed.");
    } catch (cause) {
      setActionError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not remove this dependency.",
      );
    }
  }

  return {
    selectedId,
    projectsError,
    tasks,
    loading,
    error,
    creating,
    setCreating,
    actionError,
    saving,
    editableProjects,
    byId,
    items,
    removeDependency,
  };
}
