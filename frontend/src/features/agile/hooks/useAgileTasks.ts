import { useCallback, useEffect, useState } from "react";
import { getTasks, updateTask } from "../../../api/tasks";
import type { Task, TaskStatus } from "../../../entities/task";

export function useAgileTasks(projectId: number | null, activeSprintOnly = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await getTasks(projectId, activeSprintOnly ? "active" : null));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load work items.");
    } finally {
      setLoading(false);
    }
  }, [projectId, activeSprintOnly]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      try {
        const result = await getTasks(projectId, activeSprintOnly ? "active" : null);
        if (active) { setTasks(result); setError(""); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load work items.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [projectId, activeSprintOnly]);

  const update = useCallback(async (taskId: number, changes: Partial<Task>) => {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous) return;
    setError("");
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...changes } : task));
    try {
      const saved = await updateTask(taskId, changes);
      setTasks((current) => current.map((task) => task.id === taskId ? saved : task));
      return saved;
    } catch (cause) {
      setTasks((current) => current.map((task) => task.id === taskId ? previous : task));
      setError(cause instanceof Error ? cause.message : "Unable to update this work item.");
    }
  }, [tasks]);

  const sync = useCallback(async () => {
    try { setTasks(await getTasks(projectId, activeSprintOnly ? "active" : null)); }
    catch { /* Keep the last useful board state during a temporary connection drop. */ }
  }, [projectId, activeSprintOnly]);

  const move = useCallback((taskId: number, status: TaskStatus) => update(taskId, { status }), [update]);
  return { tasks, setTasks, loading, error, setError, reload, sync, update, move };
}
