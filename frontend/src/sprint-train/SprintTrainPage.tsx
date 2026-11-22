import { SprintTrainStyles } from "./SprintTrain.styles";
import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type FormEvent,
  type CSSProperties,
} from "react";
import { AlertTriangle, CalendarDays, Check, Search, TrainFront, X } from "lucide-react";
import { createSprint, getSprints } from "../features/tasks/api/sprints";
import { createTask } from "../features/tasks/api/tasks";
import type { Sprint, Task } from "../features/tasks/entities/task";
import { useAgileTasks } from "../features/tasks/hooks/useAgileTasks";
import { WorkItemCard } from "../features/tasks/components/WorkItemCard";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { SprintStoryDetailsDrawer } from "./components/SprintStoryDetailsDrawer";
import { SprintPlanningDetails } from "./components/SprintPlanningDetails";
import { SprintTrainHeader } from "./components/SprintTrainHeader";
import { BacklogDrawer } from "./components/BacklogDrawer";
import TeamCapacity from "./components/TeamCapacity";
import { getSprintDisplayCount } from "../common/features/settings/sprintDisplayPreference";
import type { TranslationKey } from "../common/entities/language";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { translate } from "../common/shared/i18n/translate";
import type { SprintFilter, WorkflowTab, WorkflowTabOption } from "./entities/sprintTrain";
import { formatDate, points, teamName } from "./utils/sprintTrain";
import { firstValidationError, sprintSchema, taskSchema } from "../common/validation/schemas";
import { useToast } from "../common/features/notifications/useToast";

const sprintFilterLabelKeys: Record<SprintFilter, TranslationKey> = {
  all: "sprintTrain.filterAll",
  active: "sprintTrain.filterActive",
  future: "sprintTrain.filterFuture",
};

export default function SprintTrainPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { projects, selectedId: projectId } = useProjectContext();
  const trainProjectId = projectId;
  const selectedProject = projects.find((project) => project.id === trainProjectId) ?? null;
  const agile = useAgileTasks(trainProjectId);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintError, setSprintError] = useState("");
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintStart, setNewSprintStart] = useState("");
  const [newSprintEnd, setNewSprintEnd] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [newSprintCapacity, setNewSprintCapacity] = useState("");
  const [newSprintActive, setNewSprintActive] = useState(false);
  const [savingSprint, setSavingSprint] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [detailsStoryId, setDetailsStoryId] = useState<number | null>(null);
  const [sprintDisplayCount, setSprintDisplayCount] = useState(getSprintDisplayCount);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDescription, setNewStoryDescription] = useState("");
  const [newStoryEstimate, setNewStoryEstimate] = useState("");
  const [savingStory, setSavingStory] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkflowTab>("workflow");
  const [search, setSearch] = useState("");
  const [backlogSearch, setBacklogSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [sprintFilter, setSprintFilter] = useState<SprintFilter>("all");
  const [readyOnly, setReadyOnly] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [wishlistSavingId, setWishlistSavingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    void getSprints(trainProjectId)
      .then((result) => {
        if (active) {
          setSprints(result);
          setSprintError("");
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setSprintError(
            cause instanceof Error ? cause.message : translate("sprintTrain.errorLoadSprints"),
          );
      });
    return () => {
      active = false;
    };
  }, [trainProjectId]);

  useEffect(() => {
    const syncSprintDisplay = () => setSprintDisplayCount(getSprintDisplayCount());
    window.addEventListener("storage", syncSprintDisplay);
    return () => window.removeEventListener("storage", syncSprintDisplay);
  }, []);

  const selectedSprint =
    sprints.find((sprint) => sprint.id === selectedSprintId) ??
    sprints.find((sprint) => sprint.is_active) ??
    sprints[0] ??
    null;
  const backlogItems = useMemo(
    () => agile.tasks.filter((task) => task.status === "backlog"),
    [agile.tasks],
  );
  const teams = useMemo(() => [...new Set(agile.tasks.map(teamName))].sort(), [agile.tasks]);
  const sprintTasks = useMemo(
    () =>
      agile.tasks
        .filter((task) => task.sprint === selectedSprint?.id && task.status !== "backlog")
        .sort((a, b) => a.rank - b.rank || a.id - b.id),
    [agile.tasks, selectedSprint?.id],
  );
  const filteredSprintTasks = sprintTasks.filter(
    (task) =>
      `${task.title} ${task.id} ${task.assignee_name} ${teamName(task)}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (teamFilter === "all" || teamName(task) === teamFilter),
  );
  const filteredBacklog = backlogItems.filter(
    (task) =>
      `${task.title} ${task.id} ${task.tags.join(" ")} ${task.assignee_name}`
        .toLowerCase()
        .includes(backlogSearch.toLowerCase()) &&
      (teamFilter === "all" || teamName(task) === teamFilter) &&
      (!readyOnly || task.ready_for_sprint) &&
      (!wishlistOnly || task.is_wishlisted),
  );
  const sprintPoints = (sprintId: number) =>
    agile.tasks
      .filter((task) => task.sprint === sprintId && task.status !== "backlog")
      .reduce((total, task) => total + points(task), 0);
  const searchedSprints = sprints.filter((sprint) =>
    `${sprint.name} ${sprint.goal}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredSprints = searchedSprints.filter((sprint) => {
    if (sprintFilter === "active") return sprint.is_active;
    if (sprintFilter === "future") return !sprint.is_active && !sprint.is_closed;
    return true;
  });
  const orderedSprints = [...filteredSprints].sort((a, b) => {
    const rank = (sprint: Sprint) => (sprint.is_active ? 0 : sprint.is_closed ? 2 : 1);
    return (
      rank(a) - rank(b) ||
      (a.start_date ?? "9999-99-99").localeCompare(b.start_date ?? "9999-99-99") ||
      a.id - b.id
    );
  });
  const visibleSprints = orderedSprints.slice(0, sprintDisplayCount);
  const detailsStory =
    detailsStoryId === null
      ? null
      : (agile.tasks.find((task) => task.id === detailsStoryId) ?? null);

  function toggleStoryDetails(taskId: number) {
    setDetailsStoryId((current) => (current === taskId ? null : taskId));
  }

  async function toggleWishlist(task: Task) {
    if (wishlistSavingId !== null) return;
    setWishlistSavingId(task.id);
    try {
      await agile.update(task.id, { is_wishlisted: !task.is_wishlisted });
    } finally {
      setWishlistSavingId(null);
    }
  }

  function reorderStory(taskId: number, targetId: number) {
    if (taskId === targetId) return;
    const reordered = [...sprintTasks];
    const from = reordered.findIndex((task) => task.id === taskId);
    const to = reordered.findIndex((task) => task.id === targetId);
    if (from < 0 || to < 0) return;
    reordered.splice(to, 0, ...reordered.splice(from, 1));
    agile.setTasks((current) =>
      current.map((task) => {
        const rank = reordered.findIndex((item) => item.id === task.id);
        return rank < 0 ? task : { ...task, rank };
      }),
    );
    void Promise.all(reordered.map((task, rank) => agile.update(task.id, { rank })));
  }
  const dependencies = agile.tasks.filter(
    (task) =>
      task.sprint !== null &&
      task.blocked_by.some((id) =>
        agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
      ),
  );
  const newSprintProject = selectedProject;

  function openSprintForm() {
    setNewSprintName("");
    setNewSprintStart("");
    setNewSprintEnd("");
    setNewSprintGoal("");
    setNewSprintCapacity("");
    setNewSprintActive(false);
    setSprintError("");
    setCreateSprintOpen(true);
  }

  async function submitSprint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newSprintProject) {
      const message = t("sprintTrain.errorChooseProjectAndName");
      setSprintError(message);
      toast("error", message);
      return;
    }
    const validationError = firstValidationError(sprintSchema, {
      name: newSprintName,
      goal: newSprintGoal,
      startDate: newSprintStart,
      endDate: newSprintEnd,
      capacity: newSprintCapacity,
    });
    if (validationError) {
      setSprintError(validationError);
      toast("error", validationError);
      return;
    }
    const capacity = newSprintCapacity.trim() ? Number(newSprintCapacity) : null;
    setSavingSprint(true);
    setSprintError("");
    try {
      const sprint = await createSprint(
        newSprintProject.id,
        newSprintName.trim(),
        newSprintActive,
        newSprintStart,
        newSprintEnd,
        newSprintGoal.trim(),
        capacity,
      );
      setSprints((current) => [sprint, ...current]);
      setSelectedSprintId(sprint.id);
      setCreateSprintOpen(false);
      const message = t("sprintTrain.sprintCreatedFor", {
        sprint: sprint.name,
        project: newSprintProject.name,
      });
      setFeedback(message);
      toast("success", message);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("sprintTrain.errorCreateSprint");
      setSprintError(message);
      toast("error", message);
    } finally {
      setSavingSprint(false);
    }
  }

  async function submitStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = firstValidationError(taskSchema, {
      title: newStoryTitle,
      description: newStoryDescription,
    });
    if (!selectedSprint || validationError) {
      const message = !selectedSprint
        ? t("sprintTrain.errorSelectSprintAndTitle")
        : validationError!;
      setFeedback(message);
      toast("error", message);
      return;
    }
    setSavingStory(true);
    setFeedback("");
    try {
      const story = await createTask({
        project_id: selectedSprint.project,
        title: newStoryTitle.trim(),
        description: newStoryDescription.trim(),
        status: "todo",
        work_type: "task",
        priority: "medium",
        estimate: newStoryEstimate.trim(),
        tags: [],
        rank: sprintTasks.length,
        blocked: false,
        ready_for_sprint: false,
        assignee: null,
        sprint: selectedSprint.id,
        parent: null,
      });
      agile.setTasks((current) => [...current, story]);
      setNewStoryTitle("");
      setNewStoryDescription("");
      setNewStoryEstimate("");
      setCreateStoryOpen(false);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("sprintTrain.errorCreateStory");
      setFeedback(message);
      toast("error", message);
    } finally {
      setSavingStory(false);
    }
  }

  function onDragStart(event: DragEvent<HTMLElement>, taskId: number) {
    event.dataTransfer.setData("text/plain", String(taskId));
    event.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function onDrop(event: DragEvent<HTMLElement>, sprint: Sprint) {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData("text/plain"));
    const task = backlogItems.find((item) => item.id === taskId);
    if (!task) return;
    if (task.project !== sprint.project) {
      setFeedback(t("sprintTrain.errorSameProject"));
      return;
    }
    setFeedback("");
    const moved = await agile.update(taskId, { sprint: sprint.id, status: "todo" });
    if (moved) {
      setSelectedSprintId(sprint.id);
    } else {
      setFeedback(agile.error || t("sprintTrain.errorAddToSprint"));
    }
  }

  const tabs: WorkflowTabOption[] = [
    { id: "workflow", label: t("sprintTrain.tabWorkflow") },
    { id: "capacity", label: t("sprintTrain.teamCapacity") },
    {
      id: "dependencies",
      label: t(
        dependencies.length === 1
          ? "sprintTrain.tabDependenciesSingular"
          : "sprintTrain.tabDependenciesPlural",
        { count: dependencies.length },
      ),
    },
  ];

  return (
    <main
      className={`sprint-train-page min-w-0 bg-slate-50 text-slate-900 ${isDrawerOpen ? "is-backlog-open" : ""}`}
    >
      <SprintTrainStyles />
      <div className="sprint-train-layout">
        <div className="min-w-0">
          <SprintTrainHeader
            projectName={selectedProject?.name ?? t("sprintTrain.allProjects")}
            role={selectedProject?.my_role ?? undefined}
            drawerOpen={isDrawerOpen}
            storyLabel={t("sprintTrain.addStory")}
            closeStoryLabel={t("sprintTrain.closeAddStory")}
            newSprintLabel={t("sprintTrain.newSprint")}
            sectionLabel={t("app.sprintTrain")}
            canCreateSprint={Boolean(projectId)}
            onToggleBacklog={() => {
              setCreateStoryOpen(false);
              setIsDrawerOpen((open) => !open);
            }}
            onCreateSprint={openSprintForm}
          />

          <section className="sprint-train-toolbar mb-5 rounded-xl border border-slate-200 bg-white p-3">
            <nav aria-label={t("sprintTrain.viewsNav")} className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            {activeTab !== "capacity" && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-44 flex-1 lg:flex-none">
                  <span className="sr-only">{t("sprintTrain.searchStoriesAndSprints")}</span>
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("sprintTrain.searchStoriesPlaceholder")}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <select
                  aria-label={t("sprintTrain.filterByTeam")}
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">{t("sprintTrain.allTeams")}</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
                <div className="flex rounded-lg border border-slate-200 p-0.5">
                  {(["all", "active", "future"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSprintFilter(filter)}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold capitalize ${sprintFilter === filter ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                      {t(sprintFilterLabelKeys[filter])}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {(sprintError || agile.error || feedback) && (
            <div
              role="status"
              className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${sprintError || agile.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}
            >
              {sprintError || agile.error ? <AlertTriangle size={16} /> : <Check size={16} />}
              <span>{sprintError || agile.error || feedback}</span>
              <button
                type="button"
                onClick={() => {
                  setFeedback("");
                  agile.setError("");
                }}
                className="ml-auto text-xs font-semibold"
              >
                {t("sprintTrain.dismiss")}
              </button>
            </div>
          )}

          {activeTab === "workflow" && (
            <div className="min-w-0">
              <div className="min-w-0 space-y-5">
                <section aria-label={t("sprintTrain.sprintPipeline")} className="sprint-pipeline">
                  <div
                    className="sprint-pipeline-track"
                    style={
                      {
                        "--sprint-columns": Math.min(3, Math.max(visibleSprints.length, 1)),
                      } as CSSProperties
                    }
                  >
                    {visibleSprints.map((sprint) => {
                      const tasks = agile.tasks.filter(
                        (task) => task.sprint === sprint.id && task.status !== "backlog",
                      );
                      const isSelected = sprint.id === selectedSprint?.id;
                      const sprintProjectName = projects.find(
                        (project) => project.id === sprint.project,
                      )?.name;
                      return (
                        <div
                          key={sprint.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedSprintId(sprint.id);
                            }
                          }}
                          onClick={() => setSelectedSprintId(sprint.id)}
                          onDragOver={onDragOver}
                          onDrop={(event) => void onDrop(event, sprint)}
                          className={`group cursor-pointer rounded-xl border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md ${isSelected ? "sprint-selected" : "border-slate-200"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-[.15em] text-indigo-600">
                                {sprint.is_closed
                                  ? t("sprintTrain.completedSprint")
                                  : sprint.is_active
                                    ? t("sprintTrain.activeSprint")
                                    : t("sprintTrain.upcomingSprint")}
                              </p>
                              <h2 className="mt-1 font-bold text-slate-900">{sprint.name}</h2>
                              {!selectedProject && sprintProjectName && (
                                <p className="mt-1 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-500">
                                  {sprintProjectName}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 flex items-center gap-1.5 text-[calc(11px*var(--taskflow-font-scale,1))] text-slate-500">
                            <CalendarDays size={12} />
                            {formatDate(sprint.start_date)} – {formatDate(sprint.end_date)}
                          </p>
                          {sprint.goal && (
                            <p className="mt-1 line-clamp-1 text-[calc(11px*var(--taskflow-font-scale,1))] text-slate-600">
                              {sprint.goal}
                            </p>
                          )}
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                              <p className="text-[calc(9px*var(--taskflow-font-scale,1))] font-semibold uppercase                   text-slate-500">
                                {t("sprintTrain.stories")}
                              </p>
                              <p className="text-xs font-bold">{tasks.length}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                              <p className="text-[calc(9px*var(--taskflow-font-scale,1))] font-semibold uppercase text-slate-500">
                                {t("sprintTrain.pointsCapacity")}
                              </p>
                              <p className="text-xs font-bold">
                                {t("sprintTrain.pointsOfCapacity", {
                                  points: sprintPoints(sprint.id),
                                  capacity: sprint.capacity_points ?? "—",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!visibleSprints.length && (
                    <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                      <TrainFront className="mx-auto text-slate-400" size={28} />
                      <p className="mt-3 font-semibold">{t("sprintTrain.noSprints")}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {agile.loading
                          ? t("sprintTrain.loadingProjectWork")
                          : t("sprintTrain.createSprintHint")}
                      </p>
                    </div>
                  )}
                </section>

                <section
                  onDragOver={onDragOver}
                  onDrop={(event) => selectedSprint && void onDrop(event, selectedSprint)}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <header className="border-b border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="sprint-stories-heading">
                        <h2 className="font-bold text-slate-900">
                          {selectedSprint
                            ? t("sprintTrain.sprintStoriesListFor", { name: selectedSprint.name })
                            : t("sprintTrain.sprintStoriesList")}
                        </h2>
                        {selectedSprint && (
                          <SprintPlanningDetails
                            key={selectedSprint.id}
                            sprint={selectedSprint}
                            canEdit={
                              selectedSprint.can_manage ??
                              ["owner", "admin"].includes(
                                projects.find((project) => project.id === selectedSprint.project)
                                  ?.my_role ?? "",
                              )
                            }
                            onSaved={(saved) =>
                              setSprints((current) =>
                                current.map((sprint) => (sprint.id === saved.id ? saved : sprint)),
                              )
                            }
                          />
                        )}
                      </div>
                      {selectedSprint && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          {t("sprintTrain.points", { points: sprintPoints(selectedSprint.id) })}
                        </span>
                      )}
                    </div>
                  </header>
                  <div className="divide-y divide-slate-100">
                    {filteredSprintTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, task.id)}
                        onDragOver={onDragOver}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const draggedId = Number(event.dataTransfer.getData("text/plain"));
                          if (sprintTasks.some((item) => item.id === draggedId))
                            reorderStory(draggedId, task.id);
                          else if (selectedSprint) void onDrop(event, selectedSprint);
                        }}
                        className="cursor-grab px-2 py-1 active:cursor-grabbing"
                      >
                        <WorkItemCard
                          compact
                          task={task}
                          headingLevel={3}
                          candidates={agile.tasks}
                          members={
                            projects.find((project) => project.id === task.project)?.members ?? []
                          }
                          onAssign={(userId) => void agile.update(task.id, { assignee: userId })}
                          sprintAction="backlog"
                          onSprintAction={() =>
                            void agile.update(task.id, { status: "backlog", sprint: null })
                          }
                          onEdit={() => toggleStoryDetails(task.id)}
                        />
                      </div>
                    ))}
                    {!filteredSprintTasks.length && (
                      <p className="p-8 text-center text-sm text-slate-500">
                        {selectedSprint
                          ? t("sprintTrain.noStoriesInSprint")
                          : t("sprintTrain.selectSprintToViewStories")}
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === "capacity" && (
            <TeamCapacity
              sprints={sprints}
              selectedSprint={selectedSprint}
              onSelectSprint={setSelectedSprintId}
              onSprintUpdated={(saved) =>
                setSprints((current) =>
                  current.map((sprint) => (sprint.id === saved.id ? saved : sprint)),
                )
              }
              onReviewStories={() => setActiveTab("workflow")}
            />
          )}

          {activeTab === "dependencies" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <header className="border-b border-slate-200 p-4">
                <h3 className="font-bold">{t("sprintTrain.dependencyMatrix")}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {t("sprintTrain.dependencyMatrixHint")}
                </p>
              </header>
              <div className="divide-y divide-slate-100">
                {dependencies.map((task) => {
                  const blockedBy = task.blocked_by
                    .map((id) => agile.tasks.find((candidate) => candidate.id === id))
                    .filter((candidate): candidate is Task =>
                      Boolean(candidate && candidate.status !== "done"),
                    );
                  return (
                    <div
                      key={task.id}
                      className="grid gap-2 p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold text-indigo-600">
                          NEX-{task.id} · {task.sprint_name ?? t("sprintTrain.sprint")}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{task.title}</p>
                      </div>
                      <div className="hidden text-slate-400 md:block">←</div>
                      <div className="flex flex-wrap gap-2">
                        {blockedBy.map((dependency) => (
                          <span
                            key={dependency.id}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700"
                          >
                            <AlertTriangle size={12} />
                            NEX-{dependency.id}: {dependency.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {!dependencies.length && (
                  <p className="p-8 text-center text-sm text-slate-500">
                    {t("sprintTrain.noUnresolvedDependencies")}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
        <BacklogDrawer
          open={isDrawerOpen}
          createStoryOpen={createStoryOpen}
          selectedSprint={selectedSprint}
          selectedSprintPoints={selectedSprint ? sprintPoints(selectedSprint.id) : 0}
          wishlistOnly={wishlistOnly}
          itemCount={filteredBacklog.length}
          newStoryTitle={newStoryTitle}
          newStoryDescription={newStoryDescription}
          newStoryEstimate={newStoryEstimate}
          savingStory={savingStory}
          backlogSearch={backlogSearch}
          readyOnly={readyOnly}
          filteredBacklog={filteredBacklog}
          loading={agile.loading}
          selectedTaskId={detailsStoryId}
          wishlistSavingId={wishlistSavingId}
          onClose={() => setIsDrawerOpen(false)}
          onToggleWishlistView={() => setWishlistOnly((current) => !current)}
          onToggleCreateStory={() => setCreateStoryOpen((open) => !open)}
          onSubmitStory={(event) => void submitStory(event)}
          onStoryTitleChange={setNewStoryTitle}
          onStoryDescriptionChange={setNewStoryDescription}
          onStoryEstimateChange={setNewStoryEstimate}
          onSearchChange={setBacklogSearch}
          onToggleReady={() => setReadyOnly((ready) => !ready)}
          onDragStart={onDragStart}
          onSelectStory={toggleStoryDetails}
          onToggleWishlist={(task) => void toggleWishlist(task)}
        />
      </div>
      {detailsStory && (
        <SprintStoryDetailsDrawer
          task={detailsStory}
          projectName={projects.find((project) => project.id === detailsStory.project)?.name}
          onUpdate={(changes) => void agile.update(detailsStory.id, changes)}
          onClose={() => setDetailsStoryId(null)}
          backlogDrawerOpen={isDrawerOpen}
        />
      )}
      {createSprintOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !savingSprint) setCreateSprintOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-sprint-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <header className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide             text-indigo-600">
                  {t("app.sprintTrain")}
                </p>
                <h2 id="create-sprint-title" className="mt-1 text-xl font-bold">
                  {t("sprintTrain.createSprint")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("sprintTrain.createSprintDialogHint")}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("sprintTrain.closeCreateSprintDialog")}
                disabled={savingSprint}
                onClick={() => setCreateSprintOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </header>
            <form onSubmit={(event) => void submitSprint(event)} className="space-y-3">
              {selectedProject ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {t("app.project")}: <span className="font-semibold">{selectedProject.name}</span>
                </p>
              ) : (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {t("sprintTrain.errorChooseProjectAndName")}
                </p>
              )}
              <label className="block text-sm font-medium text-slate-700">
                {t("sprintTrain.sprintName")}
                <input
                  required
                  maxLength={100}
                  value={newSprintName}
                  onChange={(event) => setNewSprintName(event.target.value)}
                  placeholder={t("sprintTrain.sprintNamePlaceholder")}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  {t("sprintTrain.startDate")}
                  <input
                    type="date"
                    value={newSprintStart}
                    onChange={(event) => setNewSprintStart(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {t("sprintTrain.endDate")}
                  <input
                    type="date"
                    value={newSprintEnd}
                    min={newSprintStart || undefined}
                    onChange={(event) => setNewSprintEnd(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                {t("sprintTrain.capacityPoints")}
                <input
                  type="number"
                  min="0"
                  max="32767"
                  step="1"
                  value={newSprintCapacity}
                  onChange={(event) => setNewSprintCapacity(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("sprintTrain.sprintGoal")}
                <textarea
                  maxLength={255}
                  rows={2}
                  value={newSprintGoal}
                  onChange={(event) => setNewSprintGoal(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </label>
              <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={newSprintActive}
                  onChange={(event) => setNewSprintActive(event.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-medium">{t("sprintTrain.startAsActive")}</span>
                  <span className="text-xs">{t("sprintTrain.plannedSprintHint")}</span>
                </span>
              </label>
              {sprintError && (
                <p role="alert" className="text-sm text-rose-600">
                  {sprintError}
                </p>
              )}
              <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={savingSprint}
                  onClick={() => setCreateSprintOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {t("sprintTrain.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={savingSprint || !projectId}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingSprint ? t("sprintTrain.creating") : t("sprintTrain.createSprint")}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
