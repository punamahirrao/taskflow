import { useCallback, useEffect, useState } from "react";
import { getProjectTasks, updateTaskStatus } from "../../../api/tasks";
import type { Task, TaskStatus } from "../../../entities/task";

export function useProjectTasks(projectId: number | string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    getProjectTasks(projectId).then((result) => { if (active) setTasks(result); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load tasks."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  const moveTask = useCallback(async (taskId: number, status: TaskStatus) => {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous || previous.status === status) return;
    setError("");
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
    try {
      await updateTaskStatus(taskId, status);
    } catch (cause) {
      setTasks((current) => current.map((task) => task.id === taskId ? previous : task));
      setError(cause instanceof Error ? cause.message : "Unable to move task.");
    }
  }, [tasks]);

  return { tasks, setTasks, loading, error, setError, moveTask };
}
