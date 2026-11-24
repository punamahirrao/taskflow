import { useMemo, useState } from "react";
import type { Project } from "../../../common/entities/project";
import { useToast } from "../../../common/features/notifications/useToast";
import { createTask, updateTask } from "../../../features/tasks/api/tasks";
import type { Task } from "../../../features/tasks/entities/task";
import { useAgileTasks } from "../../../features/tasks/hooks/useAgileTasks";
import { type RoadmapFeatureValues } from "../../components/feature-dialog/RoadmapFeatureDialog";
import { buildRoadmap, FEATURE_TYPES, statusLabel, weekLabel } from "../../utils/roadmapModel";
import { featureColor, withStoryProgress } from "../../utils/timelineModel";

export function useRoadmapWorkspaceModel({ project }: { project: Project }) {
  const { tasks, setTasks, loading, error, reload, sync } = useAgileTasks(project.id);
  const toast = useToast();
  const [view, setView] = useState<"network" | "timeline">("timeline");
  const [tab, setTab] = useState<"features" | "dependencies" | "stories">("features");
  const [query, setQuery] = useState("");
  const [allWork, setAllWork] = useState(false);
  const [showCritical, setShowCritical] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [showInsights, setShowInsights] = useState(false);
  const [newFeatureStart, setNewFeatureStart] = useState<string>();
  const canWrite = ["owner", "admin", "member"].includes(project.my_role ?? "");
  const features = useMemo(
    () =>
      withStoryProgress(tasks).filter(
        (task) =>
          task.work_type !== "story" &&
          (allWork || FEATURE_TYPES.has(task.work_type) || task.tags.includes("roadmap")),
      ),
    [tasks, allWork],
  );
  const storyFeatures = features.filter((task) => FEATURE_TYPES.has(task.work_type));
  const storyFeature = storyFeatures.find((task) => task.id === selectedId) ?? storyFeatures[0];

  const plan = useMemo(() => buildRoadmap(features), [features]);
  const completionPercent = plan.nodes.length
    ? Math.round((plan.completed / plan.nodes.length) * 100)
    : 0;
  const filtered = useMemo(
    () =>
      features.filter((task) =>
        `${task.title} ${task.description} ${task.id} ${weekLabel(task.due_date)}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [features, query],
  );
  const visiblePlan = useMemo(() => {
    if (!query.trim()) return plan;
    // Preserve full-plan critical-path calculations when searching a subset.
    const layout = buildRoadmap(filtered);
    const full = new Map(plan.nodes.map((node) => [node.task.id, node]));
    return {
      ...layout,
      nodes: layout.nodes.map((node) => ({
        ...node,
        critical: full.get(node.task.id)!.critical,
        slack: full.get(node.task.id)!.slack,
      })),
      edges: layout.edges.map((edge) => ({
        ...edge,
        critical: plan.edges.some(
          (item) => item.from === edge.from && item.to === edge.to && item.critical,
        ),
      })),
    };
  }, [filtered, plan, query]);
  const selected = plan.nodes.find((node) => node.task.id === selectedId);
  function addFeature(startDate?: string) {
    setNewFeatureStart(startDate);
    setEditing(null);
  }
  async function save(values: RoadmapFeatureValues) {
    const saved = editing
      ? await updateTask(editing.id, values)
      : await createTask({
          ...values,
          project_id: project.id,
          work_type: "epic",
          tags: ["roadmap"],
          status: "backlog",
        });
    setEditing(undefined);
    setSelectedId(saved.id);
    setTasks((current) =>
      editing ? current.map((task) => (task.id === saved.id ? saved : task)) : [...current, saved],
    );
    toast("success", editing ? "Feature plan updated." : "Feature added to your roadmap.");
    await sync();
  }
  async function saveSchedule(
    task: Task,
    values: { planned_start_date: string; due_date: string },
  ) {
    const saved = await updateTask(task.id, values);
    setTasks((current) => current.map((item) => (item.id === saved.id ? saved : item)));
  }
  async function createStory(feature: Task, title: string) {
    const story = await createTask({
      title,
      project_id: project.id,
      work_type: "story",
      parent: feature.id,
      status: "backlog",
    });
    setTasks((current) => [...current, story]);
    await sync();
  }
  async function toggleStory(story: Task, complete: boolean) {
    const status = complete ? "done" : "backlog";
    setTasks((current) =>
      current.map((item) => (item.id === story.id ? { ...item, status } : item)),
    );
    try {
      const saved = await updateTask(story.id, { status });
      setTasks((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      await sync();
    } catch (cause) {
      setTasks((current) => current.map((item) => (item.id === story.id ? story : item)));
      throw cause;
    }
  }
  function exportCsv() {
    const rows: (string | number)[][] = [
      [
        "ID",
        "Feature",
        "Planned start",
        "Expected delivery",
        "ISO delivery week",
        "Status",
        "Predecessors",
        "Critical",
        "Slack (calendar days)",
        "Story progress (%)",
        "Completed stories",
        "Total stories",
        "Color",
      ],
    ];
    for (const node of plan.nodes)
      rows.push([
        node.task.id,
        node.task.title,
        node.task.planned_start_date ?? "",
        node.task.due_date ?? "",
        weekLabel(node.task.due_date),
        statusLabel(node.task.status),
        node.task.blocked_by.join("; "),
        plan.completeSchedule ? String(node.critical) : "Not calculated",
        plan.completeSchedule ? node.slack : "",
        node.task.story_progress?.percent ?? 0,
        node.task.story_progress?.completed ?? 0,
        node.task.story_progress?.total ?? 0,
        featureColor(node.task),
      ]);
    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value);
            return `"${(/^[=+@\-\t\r]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `roadmap-project-${project.id}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    tasks,
    loading,
    error,
    reload,
    view,
    setView,
    tab,
    setTab,
    query,
    setQuery,
    allWork,
    setAllWork,
    showCritical,
    setShowCritical,
    selectedId,
    setSelectedId,
    editing,
    setEditing,
    showInsights,
    setShowInsights,
    newFeatureStart,
    canWrite,
    features,
    storyFeatures,
    storyFeature,
    plan,
    completionPercent,
    filtered,
    visiblePlan,
    selected,
    addFeature,
    save,
    saveSchedule,
    createStory,
    toggleStory,
    exportCsv,
  };
}
