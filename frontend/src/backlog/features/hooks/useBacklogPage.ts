import { useEffect, useMemo, useState } from "react";
import { getSprints } from "../../../features/tasks/api/sprints";
import type { Sprint, Task } from "../../../features/tasks/entities/task";
import { useAgileProjectScope } from "../../../common/features/agile/hooks/useAgileProjectScope";
import { useBacklogTasks } from "../../hooks/useBacklogTasks";
import type { BacklogMode } from "../../entities/backlogControls";
import { groupBacklogTasks, priorityOrder, type BacklogGroupBy } from "../agile/utils/backlog";

export function useBacklogPage() {
  const scope = useAgileProjectScope();
  const agile = useBacklogTasks(scope.projectId);
  const [asOf] = useState(() => Date.now());
  const [mode, setMode] = useState<BacklogMode>("groom");
  const [groupBy, setGroupBy] = useState<BacklogGroupBy>("project");
  const [search, setSearch] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!scope.projectId) {
        if (active) setSprints([]);
        return;
      }
      try {
        const result = await getSprints(scope.projectId);
        if (active) setSprints(result);
      } catch {
        if (active) setSprints([]);
      }
    });
    return () => {
      active = false;
    };
  }, [scope.projectId]);

  const backlog = useMemo(
    () =>
      agile.tasks
        .filter((task) =>
          `${task.title} ${task.description} ${task.tags.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort(
          (a, b) =>
            a.rank - b.rank || priorityOrder(a.priority) - priorityOrder(b.priority) || a.id - b.id,
        ),
    [agile.tasks, search],
  );
  const epicRollups = useMemo(
    () =>
      new Map(
        agile.tasks
          .filter((task) => task.work_type === "epic" || task.work_type === "initiative")
          .map((epic) => {
            const children = agile.tasks.filter((task) => task.parent === epic.id);
            return [
              epic.id,
              {
                done: children.filter((task) => task.status === "done").length,
                total: children.length,
              },
            ] as const;
          }),
      ),
    [agile.tasks],
  );
  const grouped = groupBacklogTasks(backlog, scope.projects, groupBy);
  const activeSprint = sprints.find((sprint) => sprint.is_active && !sprint.is_closed);
  const editingTask = agile.tasks.find((task) => task.id === editingTaskId) ?? null;
  const editingProject = editingTask
    ? scope.projects.find((project) => project.id === editingTask.project)
    : undefined;

  const openCapture = () => setCaptureOpen(true);
  return {
    openCapture,
    healthProps: { tasks: agile.tasks, backlog, asOf },
    workspaceProps: {
      controls: { mode, setMode, groupBy, setGroupBy, search, setSearch },
      error: agile.error,
      list: {
        loading: agile.loading,
        backlog,
        tasks: agile.tasks,
        projects: scope.projects,
        groups: grouped,
        activeSprint,
        sprintBusy: false,
        epicRollups,
        onCapture: openCapture,
        onReorder: (taskIds: number[]) => void agile.reorder(taskIds),
        reordering: agile.isReordering,
        onUpdate: agile.update,
        onEdit: setEditingTaskId,
      },
    },
    captureProps: captureOpen
      ? {
          projects: scope.projects,
          defaultProjectId: scope.projectId,
          onClose: () => setCaptureOpen(false),
          onCreated: (task: Task) => agile.setTasks((current) => [...current, task]),
        }
      : null,
    editorProps:
      editingTask && editingProject
        ? {
            task: editingTask,
            project: editingProject,
            candidates: agile.tasks,
            onClose: () => setEditingTaskId(null),
            onSave: (changes: Partial<Task>) => agile.update(editingTask.id, changes),
          }
        : null,
  };
}
