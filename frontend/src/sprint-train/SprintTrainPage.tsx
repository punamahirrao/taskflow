import "./sprint-train.css";
import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import {
  AlertTriangle, ArrowDown, ArrowUp, CalendarDays, Check, Filter, Moon,
  Plus, Search, Sun, TrainFront, Users, Workflow, X,
} from "lucide-react";
import { createSprint, createTask, getSprints } from "../common/api/tasks";
import type { Sprint, Task } from "../common/entities/task";
import UserMenu from "../common/features/profile/components/UserMenu";
import { useTheme } from "../common/features/settings/hooks/useTheme";
import { useAgileTasks } from "../common/features/agile/hooks/useAgileTasks";
import { WorkItemCard } from "../common/features/agile/components/WorkItemCard";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { SprintStoryDetailsDrawer } from "./features/agile/components/SprintStoryDetailsDrawer";
import { getSprintDisplayCount } from "../common/features/settings/sprintDisplayPreference";
import type { TranslationKey } from "../common/entities/language";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { translate } from "../common/shared/i18n/translate";
import type { SprintFilter, WorkflowTab, WorkflowTabOption } from "./entities/sprintTrain";

const sprintFilterLabelKeys: Record<SprintFilter, TranslationKey> = {
  all: "sprintTrain.filterAll", active: "sprintTrain.filterActive", future: "sprintTrain.filterFuture",
};

function points(task: Task) {
  const parsed = Number.parseFloat(task.estimate);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string | null) {
  if (!value) return translate("sprintTrain.datesNotSet");
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function teamName(task: Task) {
  return task.tags[0] ?? task.work_type.replace("_", " ");
}

export default function SprintTrainPage() {
  const { t } = useTranslation();
  const { projects, selectedId: projectId } = useProjectContext();
  const [trainProjectId, setTrainProjectId] = useState<number | null>(null);
  const selectedProject = projects.find((project) => project.id === trainProjectId) ?? null;
  const agile = useAgileTasks(trainProjectId);
  const { theme, setTheme } = useTheme();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintError, setSprintError] = useState("");
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [newSprintProjectId, setNewSprintProjectId] = useState("");
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintStart, setNewSprintStart] = useState("");
  const [newSprintEnd, setNewSprintEnd] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [newSprintCapacity, setNewSprintCapacity] = useState("");
  const [newSprintActive, setNewSprintActive] = useState(false);
  const [savingSprint, setSavingSprint] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [addStoryDrawerOpen, setAddStoryDrawerOpen] = useState(false);
  const [detailsStoryId, setDetailsStoryId] = useState<number | null>(null);
  const [sprintDisplayCount, setSprintDisplayCount] = useState(getSprintDisplayCount);
  const [showAllSprints, setShowAllSprints] = useState(false);
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
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    void getSprints(trainProjectId).then((result) => {
      if (active) {
        setSprints(result);
        setSprintError("");
      }
    }).catch((cause: unknown) => {
      if (active) setSprintError(cause instanceof Error ? cause.message : translate("sprintTrain.errorLoadSprints"));
    });
    return () => { active = false; };
  }, [trainProjectId]);

  useEffect(() => {
    const syncSprintDisplay = () => setSprintDisplayCount(getSprintDisplayCount());
    window.addEventListener("storage", syncSprintDisplay);
    return () => window.removeEventListener("storage", syncSprintDisplay);
  }, []);

  const selectedSprint = sprints.find((sprint) => sprint.id === selectedSprintId) ??
    sprints.find((sprint) => sprint.is_active) ??
    sprints[0] ??
    null;
  const backlogItems = useMemo(() => agile.tasks.filter((task) => task.status === "backlog"), [agile.tasks]);
  const teams = useMemo(() => [...new Set(agile.tasks.map(teamName))].sort(), [agile.tasks]);
  const sprintTasks = useMemo(
    () => agile.tasks.filter((task) => task.sprint === selectedSprint?.id && task.status !== "backlog").sort((a, b) => a.rank - b.rank || a.id - b.id),
    [agile.tasks, selectedSprint?.id],
  );
  const filteredSprintTasks = sprintTasks.filter((task) =>
    `${task.title} ${task.id} ${task.assignee_name} ${teamName(task)}`.toLowerCase().includes(search.toLowerCase()) &&
    (teamFilter === "all" || teamName(task) === teamFilter),
  );
  const filteredBacklog = backlogItems.filter((task) =>
    `${task.title} ${task.id} ${task.tags.join(" ")} ${task.assignee_name}`.toLowerCase().includes(backlogSearch.toLowerCase()) &&
    (teamFilter === "all" || teamName(task) === teamFilter) &&
    (!readyOnly || task.ready_for_sprint),
  );
  const sprintPoints = (sprintId: number) => agile.tasks
    .filter((task) => task.sprint === sprintId && task.status !== "backlog")
    .reduce((total, task) => total + points(task), 0);
  const totalPoints = sprints.reduce((total, sprint) => total + sprintPoints(sprint.id), 0);
  const totalCapacity = sprints.reduce((total, sprint) => total + (sprint.capacity_points ?? 0), 0);
  const overallProgress = totalCapacity ? Math.min(100, Math.round(totalPoints / totalCapacity * 100)) : 0;
  const searchedSprints = sprints.filter((sprint) =>
    `${sprint.name} ${sprint.goal}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredSprints = searchedSprints.filter((sprint) => {
    if (sprintFilter === "active") return sprint.is_active;
    if (sprintFilter === "future") return !sprint.is_active && !sprint.is_closed;
    return true;
  });
  const orderedSprints = [...filteredSprints].sort((a, b) => {
    const rank = (sprint: Sprint) => sprint.is_active ? 0 : sprint.is_closed ? 2 : 1;
    return rank(a) - rank(b) || (a.start_date ?? "9999-99-99").localeCompare(b.start_date ?? "9999-99-99") || a.id - b.id;
  });
  const visibleSprints = showAllSprints ? orderedSprints : orderedSprints.slice(0, sprintDisplayCount);
  const detailsStory = detailsStoryId === null ? null : agile.tasks.find((task) => task.id === detailsStoryId) ?? null;

  function toggleStoryDetails(taskId: number) {
    setDetailsStoryId((current) => current === taskId ? null : taskId);
  }

  function reorderStory(taskId: number, direction: -1 | 1) {
    const index = sprintTasks.findIndex((task) => task.id === taskId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= sprintTasks.length) return;
    const reordered = [...sprintTasks];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    void Promise.all(reordered.map((task, rank) => agile.update(task.id, { rank })));
  }
  const dependencies = agile.tasks.filter((task) => task.sprint !== null && task.blocked_by.some(
    (id) => agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
  ));
  const newSprintProject = projects.find((project) => String(project.id) === newSprintProjectId) ?? null;
  const newSprintProjectHasActiveSprint = sprints.some((sprint) => sprint.project === newSprintProject?.id && sprint.is_active);

  function openSprintForm() {
    setNewSprintProjectId(String(projectId ?? projects[0]?.id ?? ""));
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
    if (!newSprintProject || !newSprintName.trim()) {
      setSprintError(t("sprintTrain.errorChooseProjectAndName"));
      return;
    }
    if (newSprintStart && newSprintEnd && newSprintEnd < newSprintStart) {
      setSprintError(t("sprintTrain.errorEndBeforeStart"));
      return;
    }
    if (newSprintActive && newSprintProjectHasActiveSprint) {
      setSprintError(t("sprintTrain.errorActiveSprintExists"));
      return;
    }
    const capacity = newSprintCapacity.trim() ? Number(newSprintCapacity) : null;
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 0 || capacity > 32767)) {
      setSprintError(t("sprintTrain.errorCapacityRange"));
      return;
    }
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
      setSprints((current) => [sprint, ...current.map((existing) =>
        sprint.is_active && existing.project === sprint.project ? { ...existing, is_active: false } : existing,
      )]);
      setSelectedSprintId(sprint.id);
      setCreateSprintOpen(false);
      setFeedback(t("sprintTrain.sprintCreatedFor", { sprint: sprint.name, project: newSprintProject.name }));
    } catch (cause) {
      setSprintError(cause instanceof Error ? cause.message : t("sprintTrain.errorCreateSprint"));
    } finally {
      setSavingSprint(false);
    }
  }

  async function submitStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSprint || !newStoryTitle.trim()) {
      setFeedback(t("sprintTrain.errorSelectSprintAndTitle"));
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
      setFeedback(t("sprintTrain.storyAddedTo", { title: story.title, sprint: selectedSprint.name }));
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : t("sprintTrain.errorCreateStory"));
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
    const moved = await agile.update(taskId, { sprint: sprint.id, status: "todo" });
    if (moved) {
      setFeedback(t("sprintTrain.storyAddedTo", { title: task.title, sprint: sprint.name }));
      setSelectedSprintId(sprint.id);
    } else {
      setFeedback(agile.error || t("sprintTrain.errorAddToSprint"));
    }
  }

  const tabs: WorkflowTabOption[] = [
    { id: "workflow", label: t("sprintTrain.tabWorkflow") },
    { id: "capacity", label: t("sprintTrain.teamCapacity") },
    { id: "dependencies", label: t(dependencies.length === 1 ? "sprintTrain.tabDependenciesSingular" : "sprintTrain.tabDependenciesPlural", { count: dependencies.length }) },
  ];

  return <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6">
    <div className="mx-auto max-w-[1800px]">
      <section data-testid="app-header" className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white" aria-hidden="true"><TrainFront size={21} /></span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold">              {selectedProject?.name ?? t("sprintTrain.allProjects")}</h1>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{t("app.sprintTrain")}</p>
            </div>
            {selectedProject?.my_role && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">{selectedProject.my_role}</span>}
          </div>
          <div className="ml-auto min-w-52 flex-1 md:max-w-sm">
            <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <span>{t("sprintTrain.piOverallProgress")}</span><span>{t("sprintTrain.progressSummary", { points: totalPoints, capacity: totalCapacity, percent: overallProgress })}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${overallProgress}%` }} /></div>
          </div>
          <button type="button" onClick={() => { setCreateStoryOpen(false); setAddStoryDrawerOpen((open) => !open); }} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus size={16} />{addStoryDrawerOpen ? t("sprintTrain.closeAddStory") : t("sprintTrain.addStory")}
          </button>
          <button type="button" onClick={openSprintForm} disabled={!projects.length} className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={16} />{t("sprintTrain.newSprint")}
          </button>
          <button type="button" aria-label={theme === "night" ? t("sprintTrain.switchToLightTheme") : t("sprintTrain.switchToNightTheme")} onClick={() => setTheme(theme === "night" ? "professional" : "night")} className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            {theme === "night" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <UserMenu />
      </section>

      <section className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label={t("sprintTrain.viewsNav")} className="flex flex-wrap gap-1">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{tab.label}</button>)}
        </nav>
          <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-slate-600"><span className="sr-only">{t("sprintTrain.filterByProject")}</span><select aria-label={t("sprintTrain.filterByProject")} value={trainProjectId ?? "all"} onChange={(event) => { setTrainProjectId(event.target.value === "all" ? null : Number(event.target.value)); setShowAllSprints(false); setSelectedSprintId(null); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">{t("sprintTrain.allProjects")}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="relative min-w-44 flex-1 lg:flex-none">
            <span className="sr-only">{t("sprintTrain.searchStoriesAndSprints")}</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("sprintTrain.searchStoriesPlaceholder")} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </label>
          <select aria-label={t("sprintTrain.filterByTeam")} value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                      <option value="all">{t("sprintTrain.allTeams")}</option>{teams.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {(["all", "active", "future"] as const).map((filter) => <button key={filter} type="button" onClick={() => setSprintFilter(filter)} className={`rounded-md px-2.5 py-1.5 text-xs font-semibold capitalize ${sprintFilter === filter ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t(sprintFilterLabelKeys[filter])}</button>)}
          </div>
        </div>
      </section>

      {(sprintError || agile.error || feedback) && <div role="status" className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${sprintError || agile.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
        {sprintError || agile.error ? <AlertTriangle size={16} /> : <Check size={16} />}
        <span>{sprintError || agile.error || feedback}</span>
        <button type="button" onClick={() => { setFeedback(""); agile.setError(""); }} className="ml-auto text-xs font-semibold">{t("sprintTrain.dismiss")}</button>
      </div>}

      {activeTab === "workflow" && <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <section aria-label={t("sprintTrain.sprintPipeline")} className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {visibleSprints.map((sprint) => {
              const tasks = agile.tasks.filter((task) => task.sprint === sprint.id && task.status !== "backlog");
              const isSelected = sprint.id === selectedSprint?.id;
              const sprintProjectName = projects.find((project) => project.id === sprint.project)?.name;
              const labels = [...new Set(tasks.map(teamName))].slice(0, 3);
              return <article key={sprint.id} role="button" tabIndex={0} aria-pressed={isSelected} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedSprintId(sprint.id); } }} onClick={() => setSelectedSprintId(sprint.id)} onDragOver={onDragOver} onDrop={(event) => void onDrop(event, sprint)} className={`group cursor-pointer rounded-xl border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md ${isSelected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-indigo-600">{sprint.is_closed ? t("sprintTrain.completedSprint") : sprint.is_active ? t("sprintTrain.activeSprint") : t("sprintTrain.upcomingSprint")}</p><h3 className="mt-1 font-bold text-slate-900">{sprint.name}</h3>{!selectedProject && sprintProjectName && <p className="mt-1 text-[10px] text-slate-500">{sprintProjectName}</p>}</div>
                  {isSelected && <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">{t("sprintTrain.activeSelection")}</span>}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarDays size={12} />{formatDate(sprint.start_date)} – {formatDate(sprint.end_date)}</p>
                {sprint.goal && <p className="mt-1 line-clamp-1 text-[11px] text-slate-600">{sprint.goal}</p>}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 px-2 py-1.5"><p className="text-[9px] font-semibold uppercase                   text-slate-500">{t("sprintTrain.stories")}</p><p className="text-xs font-bold">{tasks.length}</p></div>
                                    <div className="rounded-lg bg-slate-50 px-2 py-1.5"><p className="text-[9px] font-semibold uppercase text-slate-500">{t("sprintTrain.pointsCapacity")}</p><p className="text-xs font-bold">{t("sprintTrain.pointsOfCapacity", { points: sprintPoints(sprint.id), capacity: sprint.capacity_points ?? "—" })}</p></div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {labels.length ? labels.map((label) => <span key={label} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{label}</span>) : <span className="text-[10px] text-slate-400">{t("sprintTrain.noTeamAssigned")}</span>}
                </div>
              </article>;
            })}
            {filteredSprints.length > sprintDisplayCount && <div className="col-span-full -mt-1 flex items-center justify-end gap-3 text-xs text-slate-500"><span>{t("sprintTrain.showingSprints", { shown: visibleSprints.length, total: filteredSprints.length })}</span><button type="button" onClick={() => setShowAllSprints((current) => !current)} className="font-semibold text-indigo-600 hover:text-indigo-800">{showAllSprints ? t("sprintTrain.showFewer") : t("sprintTrain.showAll")}</button><span>{t("sprintTrain.displayLimitHint")}</span></div>}
            {!visibleSprints.length && <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <TrainFront className="mx-auto text-slate-400" size={28} /><p className="mt-3 font-semibold">{t("sprintTrain.noSprints")}</p><p className="mt-1 text-sm text-slate-500">{agile.loading ? t("sprintTrain.loadingProjectWork") : t("sprintTrain.createSprintHint")}</p>
            </div>}
          </section>

          <section onDragOver={onDragOver} onDrop={(event) => selectedSprint && void onDrop(event, selectedSprint)} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>                <h3 className="font-bold text-slate-900">{selectedSprint ? t("sprintTrain.sprintStoriesListFor", { name: selectedSprint.name }) : t("sprintTrain.sprintStoriesList")}</h3><p className="mt-1 text-xs text-slate-500">{t("sprintTrain.sprintStoriesListHint")}</p></div>
                                {selectedSprint && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{t("sprintTrain.points", { points: sprintPoints(selectedSprint.id) })}</span>}
              </div>
            </header>
            <div className="divide-y divide-slate-100">
              {filteredSprintTasks.map((task) => { const order = sprintTasks.findIndex((item) => item.id === task.id); return <div key={task.id} className="flex items-center gap-1.5 px-2 py-1"><div className="flex shrink-0 flex-col"><button type="button" aria-label={t("sprintTrain.moveUpStory", { title: task.title })} title={t("sprintTrain.moveUp")} disabled={order <= 0} onClick={() => reorderStory(task.id, -1)} className="rounded p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-25"><ArrowUp size={13} /></button><button type="button" aria-label={t("sprintTrain.moveDownStory", { title: task.title })} title={t("sprintTrain.moveDown")} disabled={order < 0 || order >= sprintTasks.length - 1} onClick={() => reorderStory(task.id, 1)} className="rounded p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-25"><ArrowDown size={13} /></button></div><div className="min-w-0 flex-1"><WorkItemCard compact task={task} candidates={agile.tasks} members={projects.find((project) => project.id === task.project)?.members ?? []} onAssign={(userId) => void agile.update(task.id, { assignee: userId })} sprintAction="backlog" onSprintAction={() => void agile.update(task.id, { status: "backlog", sprint: null })} onEdit={() => toggleStoryDetails(task.id)} /></div></div>; })}
              {!filteredSprintTasks.length && <p className="p-8 text-center text-sm text-slate-500">{selectedSprint ? t("sprintTrain.noStoriesInSprint") : t("sprintTrain.selectSprintToViewStories")}</p>}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-24">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-indigo-600">{t("sprintTrain.summaryTitle")}</p><h3 className="mt-1 font-bold">{t("sprintTrain.deliveryAtAGlance")}</h3></div><Workflow size={19} className="text-indigo-500" /></div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span className="text-xs text-slate-600">{t("sprintTrain.plannedSprints")}</span><span className="font-bold">{sprints.filter((sprint) => !sprint.is_closed).length}</span></div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3"><span className="text-xs text-emerald-800">{t("sprintTrain.activeSprints")}</span><span className="font-bold text-emerald-800">{sprints.filter((sprint) => sprint.is_active).length}</span></div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3"><span className="text-xs text-amber-800">{t("sprintTrain.backlogStories")}</span><span className="font-bold text-amber-800">{backlogItems.length}</span></div>
          </div>
          <button type="button" onClick={() => setIsDrawerOpen(true)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"><Plus size={15} />{t("sprintTrain.openGlobalBacklog")}</button>
        </aside>
      </div>}

      {activeTab === "capacity" && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="border-b border-slate-200 p-4"><h3 className="font-bold">{t("sprintTrain.teamCapacity")}</h3><p className="mt-1 text-xs text-slate-500">{t("sprintTrain.teamCapacityHint")}</p></header>
        <div className="divide-y divide-slate-100">{teams.map((team) => {
          const teamTasks = agile.tasks.filter((task) => task.sprint !== null && teamName(task) === team && task.status !== "backlog");
          const effort = teamTasks.reduce((total, task) => total + points(task), 0);
          return <div key={team} className="flex items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><Users size={17} className="text-indigo-500" /><div><p className="text-sm font-semibold">{team}</p><p className="text-xs text-slate-500">          {t("sprintTrain.assignedStories", { count: teamTasks.length })}</p></div></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{t("sprintTrain.points", { points: effort })}</span></div>;
                  })}{!teams.length && <p className="p-8 text-center text-sm text-slate-500">{t("sprintTrain.teamCapacityEmpty")}</p>}</div>
      </section>}

      {activeTab === "dependencies" && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="border-b border-slate-200 p-4"><h3 className="font-bold">{t("sprintTrain.dependencyMatrix")}</h3><p className="mt-1 text-xs text-slate-500">{t("sprintTrain.dependencyMatrixHint")}</p></header>
        <div className="divide-y divide-slate-100">{dependencies.map((task) => {
          const blockedBy = task.blocked_by.map((id) => agile.tasks.find((candidate) => candidate.id === id)).filter((candidate): candidate is Task => Boolean(candidate && candidate.status !== "done"));
          return <div key={task.id} className="grid gap-2 p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"><div><p className="text-xs font-semibold text-indigo-600">NEX-{task.id} · {task.sprint_name ?? t("sprintTrain.sprint")}</p><p className="mt-1 text-sm font-semibold">{task.title}</p></div><div className="hidden text-slate-400 md:block">←</div><div className="flex flex-wrap gap-2">{blockedBy.map((dependency) => <span key={dependency.id} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700"><AlertTriangle size={12} />NEX-{dependency.id}: {dependency.title}</span>)}</div></div>;
        })}{!dependencies.length && <p className="p-8 text-center text-sm text-slate-500">{t("sprintTrain.noUnresolvedDependencies")}</p>}</div>
      </section>}

      {isDrawerOpen && <aside aria-label={t("sprintTrain.globalBacklogDrawerAria")} className="sprint-backlog-drawer fixed bottom-0 right-0 top-0 z-30 flex w-full flex-col border-l shadow-2xl sm:w-[400px]">
        <header className="sprint-backlog-header border-b p-4">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-indigo-300">{t("sprintTrain.globalBacklogDrawer")}</p><h2 className="mt-1 text-base font-bold">{t("sprintTrain.backlogItemsAndPool")}</h2></div><button type="button" aria-label={t("sprintTrain.closeBacklogDrawer")} onClick={() => setIsDrawerOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={18} /></button></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="sprint-backlog-metric rounded-lg border p-3"><p className="text-[9px] font-semibold uppercase tracking-wide             text-slate-400">{t("sprintTrain.availableBacklogStories")}</p><p className="mt-1 text-sm font-bold">{t("sprintTrain.itemsCount", { count: backlogItems.length })}</p></div>
                        <div className="sprint-backlog-metric rounded-lg border p-3"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{t("sprintTrain.totalPool")}</p><p className="mt-1 text-sm font-bold">{t("sprintTrain.points", { points: backlogItems.reduce((total, task) => total + points(task), 0) })}</p></div>
          </div>
                      <p className="sprint-backlog-banner mt-3 rounded-lg border px-3 py-2 text-xs">{t("sprintTrain.backlogDragHint")}</p>
          <div className="mt-3">
            <button type="button" disabled={!selectedSprint} onClick={() => setCreateStoryOpen((open) => !open)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={15} />{createStoryOpen ? t("sprintTrain.cancelNewStory") : selectedSprint ? t("sprintTrain.createStoryIn", { name: selectedSprint.name }) : t("sprintTrain.selectSprintToCreateStory")}
            </button>
            {createStoryOpen && selectedSprint && <form onSubmit={(event) => void submitStory(event)} className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold">{t("sprintTrain.newStoryIn", { name: selectedSprint.name })}</p>
                            <label className="block text-xs font-medium">{t("sprintTrain.title")}<input required maxLength={255} value={newStoryTitle} onChange={(event) => setNewStoryTitle(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm" /></label>
                            <label className="block text-xs font-medium">{t("sprintTrain.description")}<textarea value={newStoryDescription} onChange={(event) => setNewStoryDescription(event.target.value)} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm" /></label>
                            <label className="block text-xs font-medium">{t("sprintTrain.storyPoints")}<input type="number" min="0" step="0.5" value={newStoryEstimate} onChange={(event) => setNewStoryEstimate(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm" /></label>
                            <button type="submit" disabled={savingStory || !newStoryTitle.trim()} className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{savingStory ? t("sprintTrain.savingStory") : t("sprintTrain.addStoryToSprint")}</button>
            </form>}
          </div>
          <div className="mt-3 flex gap-2">
            <label className="relative min-w-0 flex-1"><span className="sr-only">{t("sprintTrain.searchBacklog")}</span><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={backlogSearch} onChange={(event) => setBacklogSearch(event.target.value)} placeholder={t("sprintTrain.searchBacklogPlaceholder")} className="sprint-backlog-search w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none" /></label>
            <button type="button" aria-pressed={readyOnly} aria-label={t("sprintTrain.toggleReadyFilter")} onClick={() => setReadyOnly((ready) => !ready)} className={`sprint-backlog-filter grid size-10 shrink-0 place-items-center rounded-lg border ${readyOnly ? "border-indigo-500 bg-indigo-600 text-white" : "text-slate-500"}`}><Filter size={16} /></button>
          </div>
          {readyOnly && <p className="mt-2 text-[10px] text-indigo-200">{t("sprintTrain.readyFilterActive")}</p>}
        </header>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {filteredBacklog.map((task) => <article key={task.id} draggable onDragStart={(event) => onDragStart(event, task.id)} onClick={() => toggleStoryDetails(task.id)} aria-label={t("sprintTrain.openDetailsFor", { title: task.title })} className={`sprint-backlog-card cursor-pointer rounded-lg border p-3 transition hover:border-indigo-400 active:cursor-grabbing ${detailsStoryId === task.id ? "border-indigo-500 ring-2 ring-indigo-200" : ""}`}>
            <div className="flex items-start gap-2"><span className="font-mono text-[10px] font-bold text-indigo-600">NEX-{task.id}</span><span className="sprint-backlog-category rounded-full px-2 py-0.5 text-[9px] font-medium">{task.tags[0] ?? task.work_type}</span><span className="ml-auto whitespace-nowrap rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">{t("sprintTrain.points", { points: points(task) })}</span></div>
            <h3 className="sprint-backlog-title mt-2 pl-5 text-sm font-semibold leading-5">{task.title}</h3>
            <div className="mt-2 flex items-center justify-between gap-2 pl-5"><span className="sprint-backlog-assignee truncate text-[10px]">{t("sprintTrain.assigneeName", { name: task.assignee_name || t("sprintTrain.unassigned") })}</span><span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-300">{t("sprintTrain.statusTodo")}</span></div>
          </article>)}
          {!filteredBacklog.length && <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">{agile.loading ? t("sprintTrain.loadingBacklog") : t("sprintTrain.noBacklogMatches")}</div>}
        </div>
        <footer className="border-t border-slate-800 p-3 text-[10px] text-slate-500"><span className="inline-flex items-center gap-1"><Plus size={12} />{t("sprintTrain.backlogFooter")}</span></footer>
      </aside>}
      {addStoryDrawerOpen && <aside data-testid="sprint-add-story-drawer" aria-label={t("sprintTrain.addStoryDrawerAria")} className="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-[400px]">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 p-5"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-indigo-600">{t("app.sprintTrain")}</p><h2 className="mt-1 text-lg font-bold text-slate-900">{t("sprintTrain.addAStory")}</h2><p className="mt-1 text-xs text-slate-500">{t("sprintTrain.addStoryHint")}</p></div><button type="button" aria-label={t("sprintTrain.closeAddStoryDrawer")} onClick={() => setAddStoryDrawerOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"><X size={18} /></button></header>
        {selectedSprint ? <form onSubmit={(event) => void submitStory(event)} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide           text-indigo-500">{t("sprintTrain.selectedSprint")}</p><p className="mt-1 text-sm font-semibold text-indigo-900">{selectedSprint.name}</p><p className="text-xs text-indigo-700">{projects.find((project) => project.id === selectedSprint.project)?.name ?? t("app.project")}</p></div>
                    <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.title")}<input required maxLength={255} value={newStoryTitle} onChange={(event) => setNewStoryTitle(event.target.value)} placeholder={t("sprintTrain.storyTitlePlaceholder")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></label>
                    <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.description")}<textarea value={newStoryDescription} onChange={(event) => setNewStoryDescription(event.target.value)} rows={5} placeholder={t("sprintTrain.storyDescriptionPlaceholder")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></label>
                    <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.storyPoints")}<input type="number" min="0" step="0.5" value={newStoryEstimate} onChange={(event) => setNewStoryEstimate(event.target.value)} placeholder={t("sprintTrain.storyPointsPlaceholder")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></label>
                    <footer className="mt-auto border-t border-slate-100 pt-4"><button type="submit" disabled={savingStory || !newStoryTitle.trim()} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{savingStory ? t("sprintTrain.addingStory") : t("sprintTrain.addToSprint")}</button><button type="button" onClick={() => { setAddStoryDrawerOpen(false); setIsDrawerOpen(true); }} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">{t("sprintTrain.chooseFromBacklog")}</button></footer>
        </form> : <div className="p-5"><p className="text-sm text-slate-600">{t("sprintTrain.selectSprintBeforeAdding")}</p><button type="button" onClick={() => { setAddStoryDrawerOpen(false); setIsDrawerOpen(true); }} className="mt-4 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">{t("sprintTrain.openBacklog")}</button></div>}
      </aside>}
      {detailsStory && <SprintStoryDetailsDrawer task={detailsStory} projectName={projects.find((project) => project.id === detailsStory.project)?.name} addStoryDrawerOpen={addStoryDrawerOpen} onUpdate={(changes) => void agile.update(detailsStory.id, changes)} onClose={() => setDetailsStoryId(null)} />}
      {createSprintOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" onClick={(event) => { if (event.target === event.currentTarget && !savingSprint) setCreateSprintOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="create-sprint-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <header className="mb-4 flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide             text-indigo-600">{t("app.sprintTrain")}</p><h2 id="create-sprint-title" className="mt-1 text-xl font-bold">{t("sprintTrain.createSprint")}</h2><p className="mt-1 text-sm text-slate-500">{t("sprintTrain.createSprintDialogHint")}</p></div>
                        <button type="button" aria-label={t("sprintTrain.closeCreateSprintDialog")} disabled={savingSprint} onClick={() => setCreateSprintOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
          </header>
          <form onSubmit={(event) => void submitSprint(event)} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">{t("app.project")}<select required value={newSprintProjectId} onChange={(event) => { setNewSprintProjectId(event.target.value); setNewSprintActive(false); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.sprintName")}<input required maxLength={100} value={newSprintName} onChange={(event) => setNewSprintName(event.target.value)} placeholder={t("sprintTrain.sprintNamePlaceholder")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.startDate")}<input type="date" value={newSprintStart} onChange={(event) => setNewSprintStart(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" /></label>
              <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.endDate")}<input type="date" value={newSprintEnd} min={newSprintStart || undefined} onChange={(event) => setNewSprintEnd(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" /></label>
            </div>
            <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.capacityPoints")}<input type="number" min="0" max="32767" step="1" value={newSprintCapacity} onChange={(event) => setNewSprintCapacity(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
            <label className="block text-sm font-medium text-slate-700">{t("sprintTrain.sprintGoal")}<textarea maxLength={255} rows={2} value={newSprintGoal} onChange={(event) => setNewSprintGoal(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
            <label className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${newSprintProjectHasActiveSprint ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 text-slate-700"}`}>
              <input type="checkbox" checked={newSprintActive} disabled={newSprintProjectHasActiveSprint} onChange={(event) => setNewSprintActive(event.target.checked)} className="mt-0.5" />
              <span><span className="block font-medium">{t("sprintTrain.startAsActive")}</span><span className="text-xs">{newSprintProjectHasActiveSprint ? t("sprintTrain.activeSprintExistsHint") : t("sprintTrain.plannedSprintHint")}</span></span>
            </label>
            {sprintError && <p role="alert" className="text-sm text-rose-600">{sprintError}</p>}
            <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" disabled={savingSprint} onClick={() => setCreateSprintOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">{t("sprintTrain.cancel")}</button>
              <button type="submit" disabled={savingSprint || !projects.length} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{savingSprint ? t("sprintTrain.creating") : t("sprintTrain.createSprint")}</button>
            </footer>
          </form>
        </section>
      </div>}
    </div>
  </main>;
}
