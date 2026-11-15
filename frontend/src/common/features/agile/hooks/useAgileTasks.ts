import { useCallback, useEffect, useState } from "react";
import { getTasks, updateTask } from "../../../../project-detail/api/tasks";
import type { Task, TaskStatus } from "../../../entities/task";
import { translate } from "../../../shared/i18n/translate";

export function useAgileTasks(projectId: number | null, activeSprintOnly = false, boardId: number | null = null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setTasks([]);
    try {
      setTasks(await getTasks(projectId, activeSprintOnly ? "active" : null, boardId));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("agile.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [projectId, activeSprintOnly, boardId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setTasks([]);
      try {
        const result = await getTasks(projectId, activeSprintOnly ? "active" : null, boardId);
        if (active) { setTasks(result); setError(""); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : translate("agile.loadFailed"));
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [projectId, activeSprintOnly, boardId]);

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
      setError(cause instanceof Error ? cause.message : translate("agile.updateFailed"));
    }
  }, [tasks]);

  const sync = useCallback(async () => {
    try {
      const result = await getTasks(projectId, activeSprintOnly ? "active" : null, boardId);
      setTasks(result);
      setError("");
    }
    catch { /* Keep the last useful board state during a temporary connection drop. */ }
  }, [projectId, activeSprintOnly, boardId]);

  const move = useCallback((taskId: number, status: TaskStatus) => update(taskId, { status }), [update]);
  return { tasks, setTasks, loading, error, setError, reload, sync, update, move };
}
