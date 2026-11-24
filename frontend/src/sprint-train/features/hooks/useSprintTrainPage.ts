import { useEffect, useMemo, useState } from "react";
import { getSprints } from "../../../features/tasks/api/sprints";
import type { Sprint, Task } from "../../../features/tasks/entities/task";
import { useAgileTasks } from "../../../features/tasks/hooks/useAgileTasks";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { getSprintDisplayCount } from "../../../common/features/settings/sprintDisplayPreference";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { translate } from "../../../common/shared/i18n/translate";
import type { SprintFilter, WorkflowTab } from "../../entities/sprintTrain";
import { points, teamName } from "../../utils/sprintTrain";
import { useSprintCreation } from "../create-sprint/useSprintCreation";
import { useSprintStoryCreation } from "../create-story/useSprintStoryCreation";

export function useSprintTrainPage() {
  const { t } = useTranslation();
  const { projects, selectedId: projectId } = useProjectContext();
  const trainProjectId = projectId;
  const selectedProject = projects.find((project) => project.id === trainProjectId) ?? null;
  const agile = useAgileTasks(trainProjectId);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintError, setSprintError] = useState("");
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [detailsStoryId, setDetailsStoryId] = useState<number | null>(null);
  const [sprintDisplayCount, setSprintDisplayCount] = useState(getSprintDisplayCount);
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
  async function assignStory(taskId: number, sprint: Sprint) {
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

  function sprintSaved(saved: Sprint) {
    setSprints((current) => current.map((sprint) => (sprint.id === saved.id ? saved : sprint)));
  }
  const creation = useSprintCreation({
    project: selectedProject,
    hasProjectSelection: Boolean(projectId),
    sprintError,
    setSprintError,
    onCreated: (sprint, message) => {
      setSprints((current) => [sprint, ...current]);
      setSelectedSprintId(sprint.id);
      setFeedback(message);
    },
  });
  const storyCreation = useSprintStoryCreation({
    selectedSprint,
    storyCount: sprintTasks.length,
    onCreated: (story) => agile.setTasks((current) => [...current, story]),
    setFeedback,
  });
  return {
    activeTab,
    drawerOpen: isDrawerOpen,
    headerProps: {
      projectName: selectedProject?.name ?? t("sprintTrain.allProjects"),
      role: selectedProject?.my_role ?? undefined,
      drawerOpen: isDrawerOpen,
      storyLabel: t("sprintTrain.addStory"),
      closeStoryLabel: t("sprintTrain.closeAddStory"),
      newSprintLabel: t("sprintTrain.newSprint"),
      sectionLabel: t("app.sprintTrain"),
      canCreateSprint: Boolean(projectId),
      onToggleBacklog: () => {
        storyCreation.setOpen(false);
        setIsDrawerOpen((open) => !open);
      },
      onCreateSprint: creation.openForm,
    },
    toolbarProps: {
      activeTab,
      onTab: setActiveTab,
      dependencyCount: dependencies.length,
      search,
      onSearch: setSearch,
      teams,
      teamFilter,
      onTeam: setTeamFilter,
      sprintFilter,
      onSprintFilter: setSprintFilter,
    },
    feedbackProps: {
      error: sprintError || agile.error,
      message: feedback,
      onDismiss: () => {
        setFeedback("");
        agile.setError("");
      },
    },
    pipelineProps: {
      sprints: visibleSprints,
      tasks: agile.tasks,
      projects,
      selectedSprintId: selectedSprint?.id,
      showProjectNames: !selectedProject,
      loading: agile.loading,
      onSelect: setSelectedSprintId,
      onAssignStory: assignStory,
    },
    storiesProps: {
      selectedSprint,
      sprintTasks,
      filteredTasks: filteredSprintTasks,
      tasks: agile.tasks,
      projects,
      onAssignStory: assignStory,
      onReorder: reorderStory,
      onUpdate: agile.update,
      onSelectStory: toggleStoryDetails,
      onSprintSaved: sprintSaved,
    },
    capacityProps: {
      sprints,
      selectedSprint,
      onSelectSprint: setSelectedSprintId,
      onSprintUpdated: sprintSaved,
      onReviewStories: () => setActiveTab("workflow"),
    },
    dependenciesProps: { dependencies, tasks: agile.tasks },
    backlogProps: {
      open: isDrawerOpen,
      createStoryOpen: storyCreation.open,
      selectedSprint,
      selectedSprintPoints: selectedSprint ? sprintPoints(selectedSprint.id) : 0,
      wishlistOnly,
      itemCount: filteredBacklog.length,
      ...storyCreation.props,
      backlogSearch,
      readyOnly,
      filteredBacklog,
      loading: agile.loading,
      selectedTaskId: detailsStoryId,
      wishlistSavingId,
      onClose: () => setIsDrawerOpen(false),
      onToggleWishlistView: () => setWishlistOnly((current) => !current),
      onToggleCreateStory: () => storyCreation.setOpen((open) => !open),
      onSearchChange: setBacklogSearch,
      onToggleReady: () => setReadyOnly((ready) => !ready),
      onSelectStory: toggleStoryDetails,
      onToggleWishlist: (task: Task) => void toggleWishlist(task),
    },
    detailsProps: detailsStory
      ? {
          task: detailsStory,
          projectName: projects.find((project) => project.id === detailsStory.project)?.name,
          onUpdate: (changes: Partial<Task>) => void agile.update(detailsStory.id, changes),
          onClose: () => setDetailsStoryId(null),
          backlogDrawerOpen: isDrawerOpen,
        }
      : null,
    creationProps: creation.open ? creation.props : null,
  };
}
