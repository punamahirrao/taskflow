import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dataScope } from "../../../common/api/queryApi";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useAppDispatch, useAppSelector } from "../../../common/store";
import { useToast } from "../../../common/features/notifications/useToast";
import { updateTask } from "../../../features/tasks/api/tasks";
import type { Task } from "../../../features/tasks/entities/task";
import { myWorkCache, useMyTasksQuery } from "../../api/myWork";
import { workTabs, type WorkTab, type WorkFilter } from "../../entities/work";
import { dateKey } from "../../utils/workDates";
import { canWriteWork } from "../../utils/workPermissions";

const emptyTasks: Task[] = [];

export function useMyWork() {
  const [params, setParams] = useSearchParams();
  const activeTab = workTabs.find((tab) => tab === params.get("view")) ?? "overview";
  const [filter, setFilter] = useState<WorkFilter>("Open");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const userId = useAppSelector((state) => state.session.user?.id);
  const { projects, selectedId } = useProjectContext();
  const scope = dataScope();
  const { currentData, isFetching, error, refetch } = useMyTasksQuery(scope, { skip: !userId });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  // Keep the view personal even when using a mock handler or a server on an older version.
  const tasks =
    currentData?.filter((task) => userId != null && task.assignee === userId) ?? emptyTasks;
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const assignedProjectIds = new Set(tasks.map((task) => task.project));
  const myProjects = projects.filter(
    (project) =>
      assignedProjectIds.has(project.id) || project.members?.some((member) => member.id === userId),
  );
  const creatable = projects.filter(
    (project) =>
      canWriteWork(project.my_role) &&
      project.status !== "archived" &&
      project.members?.some((member) => member.id === userId),
  );
  const preferredProject = creatable.find((project) => project.id === selectedId);
  const createProjects = preferredProject
    ? [preferredProject, ...creatable.filter((project) => project.id !== selectedId)]
    : creatable;
  const today = dateKey(new Date());
  const open = tasks.filter((task) => task.status !== "done");
  const grouped: Record<WorkFilter, Task[]> = {
    Open: open,
    "Due today": open.filter((task) => task.due_date === today),
    Upcoming: open.filter((task) => task.due_date && task.due_date > today),
    Overdue: open.filter((task) => task.due_date && task.due_date < today),
    "High priority": open.filter((task) => task.priority === "high" || task.priority === "urgent"),
    "In review": open.filter((task) => task.status === "review"),
    Blocked: open.filter((task) => task.blocked),
    Completed: tasks.filter((task) => task.status === "done"),
  };
  const needle = search.trim().toLowerCase();
  const filtered = grouped[filter].filter((task) =>
    `#${task.id} ${task.title} ${task.project_name ?? ""}`.toLowerCase().includes(needle),
  );
  filtered.sort(
    (a, b) =>
      (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") || a.rank - b.rank || a.id - b.id,
  );
  function showTab(tab: WorkTab) {
    setParams(tab === "overview" ? {} : { view: tab });
  }

  function openTask(task: Task) {
    if (canWriteWork(projectsById.get(task.project)?.my_role)) setEditor(task);
    else navigate(`/project/${task.project}`);
  }

  function afterSave(saved: Task) {
    dispatch(
      myWorkCache.updateQueryData("myTasks", scope, (items) => {
        const index = items.findIndex((item) => item.id === saved.id);
        if (index >= 0) items[index] = saved;
        else items.push(saved);
      }),
    );
  }

  async function complete(task: Task) {
    if (savingId !== null) return;
    setSavingId(task.id);
    try {
      afterSave(await updateTask(task.id, { status: "done" }));
      toast("success", "Task marked complete.");
    } catch (cause) {
      toast("error", cause instanceof Error ? cause.message : "Could not complete this task.");
    } finally {
      setSavingId(null);
    }
  }

  const showOverview = activeTab === "overview";
  const taskPanels =
    showOverview || ["tasks", "calendar", "mentions", "projects"].includes(activeTab);

  function editorSaved(task: Task) {
    afterSave(task);
    if (editor === "new") {
      setSearch("");
      setFilter("Open");
    }
    toast("success", editor === "new" ? "Task created and assigned to you." : "Task updated.");
  }

  function selectSummary(next: WorkFilter) {
    setSearch("");
    setFilter(next);
  }

  return {
    activeTab,
    showTab,
    showOverview,
    taskPanels,
    tasks,
    myProjects,
    scope,
    loading: taskPanels && !currentData && isFetching,
    error: taskPanels && Boolean(error),
    refetch,
    openTask,
    timeStorageKey: `taskflow:my-time:${scope.organizationId}:${userId}`,
    taskProps: {
      tasks: filtered,
      grouped,
      filter,
      search,
      projectsById,
      savingId,
      today,
      canCreate: Boolean(createProjects.length && userId),
      needsProject: !createProjects.length,
      onFilterChange: setFilter,
      onSearchChange: setSearch,
      onCreate: () => setEditor("new"),
      onTask: openTask,
      onComplete: complete,
      onView: () => showTab("tasks"),
    },
    summaryProps: {
      grouped,
      filter,
      unavailable: Boolean(error && !currentData),
      onSelect: selectSummary,
    },
    editorProps:
      editor && userId
        ? {
            task: editor === "new" ? undefined : editor,
            projects: editor === "new" ? createProjects : projects,
            userId,
            onClose: () => setEditor(null),
            onSaved: editorSaved,
          }
        : null,
  };
}
