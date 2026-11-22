import { tasksQuery } from "../api/tasksQuery";
import { useCallback, useMemo, useRef, useState, type SetStateAction } from "react";
import { reorderBacklog, updateTask } from "../api/tasks";
import type { Task, TaskStatus } from "../entities/task";
import { translate } from "../../../common/shared/i18n/translate";
import { dataScope, queryApi } from "../../../common/api/queryApi";
import { useTasksQuery } from "../api/tasksQuery";
import { useAppDispatch } from "../../../common/store";

const EMPTY_TASKS: Task[] = [];

export function useAgileTasks(
  projectId: number | null,
  activeSprintOnly = false,
  boardId: number | null = null,
  enabled = true,
) {
  const dispatch = useAppDispatch();
  const { organizationId, userId } = dataScope(projectId);
  const args = useMemo(
    () => ({ organizationId, userId, projectId, activeSprintOnly, boardId }),
    [organizationId, userId, projectId, activeSprintOnly, boardId],
  );
  const query = useTasksQuery(args, {
    skip: !enabled,
    pollingInterval: 20000,
    skipPollingIfUnfocused: true,
  });
  const tasks = query.currentData ?? EMPTY_TASKS;
  const refetch = query.refetch;
  const [actionError, setError] = useState("");
  const [isReordering, setReordering] = useState(false);
  const reorderingRef = useRef(false);
  const setTasks = useCallback(
    (next: SetStateAction<Task[]>) => {
      dispatch(
        tasksQuery.util.updateQueryData("tasks", args, (current) =>
          typeof next === "function" ? next(current) : next,
        ),
      );
    },
    [dispatch, args],
  );
  const reload = useCallback(async () => {
    const result = await refetch();
    if (result.error) throw new Error("Could not refresh work items.");
  }, [refetch]);
  const sync = useCallback(async () => {
    await refetch();
  }, [refetch]);
  const update = useCallback(
    async (taskId: number, changes: Partial<Task>) => {
      const previous = tasks.find((task) => task.id === taskId);
      if (!previous) return;
      setError("");
      const patch = dispatch(
        tasksQuery.util.updateQueryData("tasks", args, (current) =>
          current.map((task) => (task.id === taskId ? { ...task, ...changes } : task)),
        ),
      );
      try {
        const saved = await updateTask(taskId, changes);
        setTasks((current) => current.map((task) => (task.id === taskId ? saved : task)));
        dispatch(queryApi.util.invalidateTags(["Tasks"]));
        return saved;
      } catch (cause) {
        patch.undo();
        dispatch(queryApi.util.invalidateTags(["Tasks"]));
        setError(cause instanceof Error ? cause.message : translate("agile.updateFailed"));
      }
    },
    [tasks, dispatch, args, setTasks],
  );
  const move = useCallback(
    (taskId: number, status: TaskStatus) => update(taskId, { status }),
    [update],
  );
  const reorder = useCallback(
    async (taskIds: number[]) => {
      if (reorderingRef.current || taskIds.length < 2) return;
      const project = tasks.find((task) => task.id === taskIds[0])?.project;
      if (!project) return;
      reorderingRef.current = true;
      setReordering(true);
      setError("");
      try {
        const { ranks } = await reorderBacklog(project, taskIds);
        const byId = new Map(ranks.map(({ id, rank }) => [id, rank]));
        setTasks((current) =>
          current.map((task) => (byId.has(task.id) ? { ...task, rank: byId.get(task.id)! } : task)),
        );
        dispatch(queryApi.util.invalidateTags(["Tasks"]));
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not reorder backlog items. Please try again.",
        );
      } finally {
        reorderingRef.current = false;
        setReordering(false);
      }
    },
    [tasks, setTasks, dispatch],
  );
  const queryError = query.error && "message" in query.error ? String(query.error.message) : "";
  return {
    tasks,
    setTasks,
    loading: query.isFetching && !query.currentData,
    error: actionError || queryError,
    setError,
    reload,
    sync,
    update,
    move,
    reorder,
    isReordering,
  };
}
