import { MyWorkStyles } from "./MyWork.styles";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AtSign,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  FileText,
  FolderKanban,
  LayoutGrid,
  ListTodo,
  OctagonAlert,
  Plus,
  Search,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { dataScope } from "../common/api/queryApi";
import { myWorkCache, useMyTasksQuery } from "./api/myWork";
import type { Task } from "../features/tasks/entities/task";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { useAppDispatch, useAppSelector } from "../common/store";
import { useToast } from "../common/features/notifications/useToast";
import { updateTask } from "../features/tasks/api/tasks";
import { WorkAgenda } from "./components/WorkAgenda";
import { WorkApprovals } from "./sections/WorkApprovals";
import {
  WorkActivity,
  WorkDocuments,
  WorkMentionsPreview,
  WorkProjects,
} from "./sections/WorkPanels";
import { WorkTaskEditor } from "./components/WorkTaskEditor";
import { WorkTime } from "./components/WorkTime";
import { dateKey, displayDueDate } from "./utils/workDates";

const tabs = [
  { id: "overview", label: "Overview", Icon: LayoutGrid },
  { id: "tasks", label: "My Tasks", Icon: ListTodo },
  { id: "approvals", label: "My Approvals", Icon: ClipboardCheck },
  { id: "calendar", label: "My Calendar", Icon: CalendarDays },
  { id: "time", label: "My Time", Icon: Clock3 },
  { id: "projects", label: "My Projects", Icon: FolderKanban },
  { id: "mentions", label: "Mentions", Icon: AtSign },
  { id: "documents", label: "My Documents", Icon: FileText },
] as const;
type Tab = (typeof tabs)[number]["id"];
const filters = [
  "Open",
  "Due today",
  "Upcoming",
  "Overdue",
  "High priority",
  "In review",
  "Blocked",
  "Completed",
] as const;
type Filter = (typeof filters)[number];
const emptyTasks: Task[] = [];

export default function MyWorkPage() {
  const [params, setParams] = useSearchParams();
  const activeTab = tabs.find((tab) => tab.id === params.get("view"))?.id ?? "overview";
  const [filter, setFilter] = useState<Filter>("Open");
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
  const writable = (role?: string | null) =>
    role === "owner" || role === "admin" || role === "member";
  const creatable = projects.filter(
    (project) =>
      writable(project.my_role) &&
      project.status !== "archived" &&
      project.members?.some((member) => member.id === userId),
  );
  const preferredProject = creatable.find((project) => project.id === selectedId);
  const createProjects = preferredProject
    ? [preferredProject, ...creatable.filter((project) => project.id !== selectedId)]
    : creatable;
  const today = dateKey(new Date());
  const open = tasks.filter((task) => task.status !== "done");
  const grouped: Record<Filter, Task[]> = {
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
  const metrics = [
    { label: "Open assignments", filter: "Open", Icon: ListTodo, tone: "violet" },
    { label: "Due today", filter: "Due today", Icon: CalendarDays, tone: "blue" },
    { label: "Overdue", filter: "Overdue", Icon: TriangleAlert, tone: "rose" },
    { label: "In review", filter: "In review", Icon: ClipboardCheck, tone: "teal" },
    { label: "Blocked", filter: "Blocked", Icon: ShieldAlert, tone: "amber" },
  ] as const;

  function showTab(tab: Tab) {
    setParams(tab === "overview" ? {} : { view: tab });
  }

  function openTask(task: Task) {
    if (writable(projectsById.get(task.project)?.my_role)) setEditor(task);
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
    showOverview ||
    activeTab === "tasks" ||
    activeTab === "calendar" ||
    activeTab === "mentions" ||
    activeTab === "projects";
  const visibleTasks = showOverview ? filtered.slice(0, 6) : filtered;
  const taskTable = (
    <section className="my-work-panel my-work-tasks">
      <header className="my-work-panel-heading">
        <h2>
          My Tasks <span>({open.length} open)</span>
        </h2>
        <div className="my-work-actions">
          {showOverview && (
            <button type="button" className="my-work-link" onClick={() => showTab("tasks")}>
              View all →
            </button>
          )}
          <button
            type="button"
            className="my-work-button primary"
            disabled={!createProjects.length || !userId}
            title={
              !createProjects.length
                ? "Join a project with task creation access to add a task"
                : undefined
            }
            onClick={() => setEditor("new")}
          >
            <Plus size={17} /> Create task
          </button>
        </div>
      </header>
      <div className="my-work-task-toolbar">
        <div className="my-work-filters" aria-label="Task filters">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item} <span>{grouped[item].length}</span>
            </button>
          ))}
        </div>
        <label className="my-work-search">
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search my tasks"
            placeholder="Search tasks…"
          />
        </label>
      </div>
      <div
        className="my-work-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Assigned tasks table"
      >
        <table className="my-work-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Complete</span>
              </th>
              <th scope="col">Task</th>
              <th scope="col">Project</th>
              <th scope="col">Priority</th>
              <th scope="col">Due date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task) => {
              const project = projectsById.get(task.project);
              const canEdit = writable(project?.my_role);
              const completeTask = task.status === "done";
              return (
                <tr key={task.id}>
                  <td>
                    {completeTask ? (
                      <Check size={17} className="text-positive" aria-label="Completed" />
                    ) : (
                      canEdit && (
                        <button
                          type="button"
                          className="my-work-complete"
                          aria-label={`Mark ${task.title} complete`}
                          disabled={savingId !== null}
                          onClick={() => void complete(task)}
                        >
                          {savingId === task.id && <span>…</span>}
                        </button>
                      )
                    )}
                  </td>
                  <td>
                    {canEdit ? (
                      <button
                        type="button"
                        className="my-work-task-title"
                        onClick={() => openTask(task)}
                      >
                        {task.title}
                      </button>
                    ) : (
                      <Link className="my-work-task-title" to={`/project/${task.project}`}>
                        {task.title}
                      </Link>
                    )}
                    {task.blocked && (
                      <OctagonAlert size={13} className="my-work-blocked" aria-label="Blocked" />
                    )}
                  </td>
                  <td>
                    <Link className="my-work-project-link" to={`/project/${task.project}`}>
                      {task.project_name ?? project?.name ?? "View project"}
                    </Link>
                  </td>
                  <td>
                    <span className={`my-work-badge priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td
                    className={
                      !completeTask && task.due_date && task.due_date <= today
                        ? "my-work-due"
                        : undefined
                    }
                  >
                    {displayDueDate(task.due_date, today)}
                  </td>
                  <td>
                    <span className={`my-work-badge status-${task.status}`}>
                      {task.status.replaceAll("_", " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!visibleTasks.length && (
              <tr>
                <td colSpan={6} className="my-work-empty">
                  {search
                    ? "No tasks match your search."
                    : `No ${filter === "Open" ? "open tasks assigned to you" : "tasks in this view"}.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showOverview && filtered.length > visibleTasks.length && (
        <footer className="my-work-panel-footer">
          <span>
            Showing {visibleTasks.length} of {filtered.length} tasks
          </span>
          <button type="button" className="my-work-link" onClick={() => showTab("tasks")}>
            See all results →
          </button>
        </footer>
      )}
    </section>
  );

  return (
    <main className="my-work" data-testid="page-my-work">
      <MyWorkStyles />
      <header className="my-work-intro">
        <h1>My Work</h1>
      </header>
      <nav className="my-work-nav" aria-label="My Work views">
        {tabs.map(({ id, label, Icon }) => (
          <Link
            key={id}
            to={id === "overview" ? "/my-work" : `/my-work?view=${id}`}
            aria-current={activeTab === id ? "page" : undefined}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      {taskPanels && error && (
        <p role="alert" className="my-work-error">
          Your tasks could not be loaded.{" "}
          <button className="my-work-link" type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </p>
      )}
      {taskPanels && !currentData && isFetching ? (
        <p role="status" className="my-work-empty">
          Loading your work…
        </p>
      ) : (
        <div className="my-work-content">
          {showOverview && (
            <>
              <div className="my-work-metrics">
                {metrics.map(({ label, filter: item, Icon, tone }) => (
                  <button
                    type="button"
                    key={item}
                    className={`my-work-metric ${tone}`}
                    aria-pressed={filter === item}
                    onClick={() => {
                      setSearch("");
                      setFilter(item);
                    }}
                  >
                    <span className="my-work-metric-icon">
                      <Icon size={23} />
                    </span>
                    <span>
                      <strong>{error && !currentData ? "–" : grouped[item].length}</strong>
                      <small>{label}</small>
                    </span>
                  </button>
                ))}
              </div>
              <div className="my-work-main-grid">
                {taskTable}
                <WorkAgenda tasks={tasks} onTask={openTask} onView={() => showTab("calendar")} />
              </div>
              <div className="my-work-bottom-grid">
                <WorkApprovals onView={() => showTab("approvals")} />
                <WorkTime
                  storageKey={`taskflow:my-time:${scope.organizationId}:${userId}`}
                  onView={() => showTab("time")}
                />
                <WorkActivity
                  scope={scope}
                  tasks={tasks}
                  onTask={openTask}
                  onView={() => showTab("mentions")}
                />
              </div>
            </>
          )}
          {activeTab === "tasks" && taskTable}
          {activeTab === "calendar" && (
            <WorkAgenda full tasks={tasks} onTask={openTask} onView={() => showTab("calendar")} />
          )}
          {activeTab === "time" && (
            <WorkTime
              full
              storageKey={`taskflow:my-time:${scope.organizationId}:${userId}`}
              onView={() => showTab("time")}
            />
          )}
          {activeTab === "projects" && <WorkProjects projects={myProjects} tasks={tasks} />}
          {activeTab === "documents" && <WorkDocuments scope={scope} />}
          {activeTab === "approvals" && <WorkApprovals full />}
          {activeTab === "mentions" && (
            <div className="my-work-mentions">
              <WorkActivity
                full
                scope={scope}
                tasks={tasks}
                onTask={openTask}
                onView={() => showTab("mentions")}
              />
              <WorkMentionsPreview />
            </div>
          )}
        </div>
      )}
      {editor && userId && (
        <WorkTaskEditor
          task={editor === "new" ? undefined : editor}
          projects={editor === "new" ? createProjects : projects}
          userId={userId}
          onClose={() => setEditor(null)}
          onSaved={(task) => {
            afterSave(task);
            if (editor === "new") {
              setSearch("");
              setFilter("Open");
            }
            toast(
              "success",
              editor === "new" ? "Task created and assigned to you." : "Task updated.",
            );
          }}
        />
      )}
    </main>
  );
}
