import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Download,
  Flag,
  GitBranch,
  Layers,
  List,
  Network,
  Pencil,
  Plus,
  Search,
  Timer,
  TriangleAlert,
  X,
} from "lucide-react";
import type { Project } from "../common/entities/project";
import type { Task } from "../features/tasks/entities/task";
import { useAgileTasks } from "../features/tasks/hooks/useAgileTasks";
import { createTask, updateTask } from "../features/tasks/api/tasks";
import { useToast } from "../common/features/notifications/useToast";
import RoadmapFeatureDialog, { type RoadmapFeatureValues } from "./components/RoadmapFeatureDialog";
import RoadmapNetwork from "./components/RoadmapNetwork";
import RoadmapTimeline from "./components/RoadmapTimeline";
import RoadmapStories from "./components/RoadmapStories";
import { featureColor, withStoryProgress } from "./utils/timelineModel";
import {
  buildRoadmap,
  FEATURE_TYPES,
  shortDate,
  statusLabel,
  weekLabel,
  type RoadmapPlan,
} from "./utils/roadmapModel";

export default function RoadmapWorkspace({ project }: { project: Project }) {
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
  return (
    <section
      className={`roadmap-content ${view === "timeline" ? "is-calendar-view" : ""} ${showInsights ? "show-insights" : ""}`}
    >
      <div className="roadmap-plan-heading">
        <div>
          <p className="roadmap-eyebrow">FROM IDEA TO DELIVERY</p>
          <h2>Feature roadmap</h2>
          <p>Keep features, dependencies and expected delivery weeks in sync.</p>
        </div>
        <div className="roadmap-plan-actions">
          <span className="roadmap-date-range">
            <CalendarDays size={15} />
            {plan.startDate
              ? `${shortDate(plan.startDate)} – ${shortDate(plan.endDate)}`
              : "No dates planned"}
          </span>
          <button
            type="button"
            className="roadmap-button primary"
            disabled={!canWrite || loading}
            onClick={() => addFeature()}
          >
            <Plus size={15} />
            Add feature
          </button>
        </div>
      </div>
      <div className="roadmap-view-tabs" aria-label="Roadmap views">
        <button type="button" aria-pressed={view === "network"} onClick={() => setView("network")}>
          <Network size={15} />
          Dependency map <span>CPM</span>
        </button>
        <button
          type="button"
          aria-pressed={view === "timeline"}
          onClick={() => setView("timeline")}
        >
          <CalendarDays size={15} />
          Timeline
        </button>
        <button
          type="button"
          className="roadmap-insights-toggle"
          aria-expanded={showInsights}
          onClick={() => setShowInsights(!showInsights)}
        >
          <Layers size={14} />
          Insights
        </button>
      </div>
      <div className="roadmap-toolbar">
        <label className="roadmap-filter">
          <Search size={15} />
          <input
            aria-label="Search roadmap features"
            type="search"
            placeholder="Search features or delivery week…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="roadmap-checkbox">
          <input
            type="checkbox"
            checked={showCritical}
            onChange={(event) => setShowCritical(event.target.checked)}
          />
          <i />
          Show critical path
        </label>
        <label className="roadmap-checkbox">
          <input
            type="checkbox"
            checked={allWork}
            onChange={(event) => setAllWork(event.target.checked)}
          />
          Include all work items
        </label>
        <button
          type="button"
          className="roadmap-button"
          disabled={!plan.nodes.length}
          onClick={exportCsv}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>
      {error && (
        <p role="alert" className="roadmap-error">
          {error}
          <button type="button" onClick={() => void reload()}>
            Retry
          </button>
        </p>
      )}
      {!canWrite && (
        <p className="roadmap-notice">
          <CircleHelp size={15} />
          You have read-only access to this project’s roadmap.
        </p>
      )}
      {plan.hasCycle && (
        <p role="alert" className="roadmap-notice warning">
          <TriangleAlert size={15} />A dependency cycle exists in this plan. Edit dependencies to
          restore a valid delivery sequence.
        </p>
      )}
      {plan.conflicts > 0 && (
        <p className="roadmap-notice warning">
          <TriangleAlert size={15} />
          {plan.conflicts} dependency overlap{plan.conflicts === 1 ? "" : "s"}: a successor starts
          before its predecessor is expected to finish. Dates are kept as planned.
        </p>
      )}
      {plan.externalCount > 0 && (
        <p className="roadmap-notice">
          <GitBranch size={15} />
          {plan.externalCount} dependencies are outside this view. Include all work items to see
          more connections. Cross-project predecessors remain in the feature details.
        </p>
      )}
      {loading ? (
        <div className="roadmap-empty" role="status">
          Loading features and dependencies…
        </div>
      ) : !plan.nodes.length && view !== "timeline" ? (
        <section className="roadmap-empty">
          <Network size={36} />
          <h3>Build your path to delivery</h3>
          <p>
            Add features, assign start and delivery dates, and connect their dependencies. Existing
            epics, initiatives and enhancements appear here automatically.
          </p>
          {canWrite && (
            <button type="button" className="roadmap-button primary" onClick={() => addFeature()}>
              <Plus size={15} />
              Plan your first feature
            </button>
          )}
          {tasks.length > 0 && (
            <button type="button" className="roadmap-button" onClick={() => setAllWork(true)}>
              Show existing work items
            </button>
          )}
        </section>
      ) : (
        <>
          <div className="roadmap-planning-grid">
            <div className="roadmap-main-column">
              <div className="roadmap-visual-panel">
                {view === "network" && !filtered.length ? (
                  <div className="roadmap-empty">
                    <Search size={28} />
                    <h3>No matching features</h3>
                    <p>Try a different name, ID or week number.</p>
                    <button type="button" className="roadmap-button" onClick={() => setQuery("")}>
                      Clear search
                    </button>
                  </div>
                ) : view === "network" ? (
                  <RoadmapNetwork
                    plan={visiblePlan}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    showCritical={showCritical}
                  />
                ) : (
                  <RoadmapTimeline
                    plan={visiblePlan}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    showCritical={showCritical}
                    canWrite={canWrite}
                    onSchedule={saveSchedule}
                    onAdd={addFeature}
                    onEdit={setEditing}
                    onExport={exportCsv}
                    query={query}
                    onQuery={setQuery}
                    allWork={allWork}
                    onAllWork={setAllWork}
                    onCritical={setShowCritical}
                  />
                )}
              </div>
              <div className="roadmap-detail-tabs">
                <button
                  type="button"
                  aria-pressed={tab === "features"}
                  onClick={() => setTab("features")}
                >
                  <List size={14} />
                  Feature list <span>{filtered.length}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "dependencies"}
                  onClick={() => setTab("dependencies")}
                >
                  <GitBranch size={14} />
                  Dependencies <span>{plan.edges.length + plan.externalCount}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "stories"}
                  onClick={() => setTab("stories")}
                >
                  User stories <span>{storyFeature?.story_progress?.total ?? 0}</span>
                </button>
                <p>Story completion updates progress automatically.</p>
              </div>
              {tab === "features" ? (
                <div className="roadmap-table-scroll">
                  <table className="roadmap-feature-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Feature</th>
                        <th>Status</th>
                        <th>Story progress</th>
                        <th>Planned start</th>
                        <th>Expected delivery</th>
                        <th>Delivery week</th>
                        <th>Predecessors</th>
                        <th>Slack</th>
                        <th>Critical</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.nodes
                        .filter((node) => filtered.some((task) => task.id === node.task.id))
                        .map((node) => (
                          <tr
                            key={node.task.id}
                            className={selectedId === node.task.id ? "selected" : ""}
                          >
                            <td>#{node.task.id}</td>
                            <td>
                              <button
                                type="button"
                                className="roadmap-table-name"
                                onClick={() => setSelectedId(node.task.id)}
                              >
                                {node.task.title}
                              </button>
                            </td>
                            <td>
                              <span
                                className={`roadmap-status ${node.task.status === "done" ? "complete" : ""}`}
                              >
                                {statusLabel(node.task.status)}
                              </span>
                            </td>
                            <td>
                              <span
                                className="roadmap-table-progress"
                                title={`${node.task.story_progress?.completed ?? 0}/${node.task.story_progress?.total ?? 0} stories complete`}
                              >
                                <i
                                  style={{
                                    background: featureColor(node.task),
                                    width: `${node.task.story_progress?.percent ?? 0}%`,
                                  }}
                                />
                                <b>{node.task.story_progress?.percent ?? 0}%</b>
                              </span>
                            </td>
                            <td>{shortDate(node.task.planned_start_date)}</td>
                            <td>{shortDate(node.task.due_date)}</td>
                            <td>
                              <span className="roadmap-week-chip">
                                {weekLabel(node.task.due_date)}
                              </span>
                            </td>
                            <td>{node.task.blocked_by.map((id) => `#${id}`).join(", ") || "—"}</td>
                            <td>{plan.completeSchedule ? `${node.slack}d` : "—"}</td>
                            <td>
                              {node.critical ? (
                                <CheckCircle2
                                  size={15}
                                  className="roadmap-critical-mark"
                                  aria-label="On critical path"
                                />
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="roadmap-edit-button"
                                aria-label={`Edit ${node.task.title}`}
                                disabled={!canWrite}
                                onClick={() => setEditing(node.task)}
                              >
                                <Pencil size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "dependencies" ? (
                <DependencyTable plan={plan} tasks={tasks} onSelect={setSelectedId} />
              ) : storyFeature ? (
                <RoadmapStories
                  key={storyFeature.id}
                  feature={storyFeature}
                  features={storyFeatures}
                  tasks={tasks}
                  canWrite={canWrite}
                  onSelect={setSelectedId}
                  onCreate={createStory}
                  onToggle={toggleStory}
                  onLink={() => setEditing(storyFeature)}
                />
              ) : (
                <p className="roadmap-empty">Add a feature to link user stories.</p>
              )}
            </div>
            <aside className="roadmap-insights" aria-label="Roadmap insights">
              <h3>Project insights</h3>
              <Insight
                icon={CalendarDays}
                label="Planned duration"
                value={plan.durationDays === null ? "Not scheduled" : `${plan.durationDays} days`}
              />
              <Insight
                icon={Timer}
                label="Critical path duration"
                value={plan.criticalDays === null ? "Not calculated" : `${plan.criticalDays} days`}
                critical
              />
              <Insight icon={Layers} label="Total features" value={String(plan.nodes.length)} />
              <Insight
                icon={GitBranch}
                label="Dependencies"
                value={String(plan.edges.length + plan.externalCount)}
              />
              <div className="roadmap-completion">
                <span>
                  <CheckCircle2 size={16} />
                  Completion<b>{completionPercent}%</b>
                </span>
                <div>
                  <i style={{ width: `${completionPercent}%` }} />
                </div>
                <small>
                  {plan.completed} of {plan.nodes.length} complete
                </small>
              </div>
              {selected && (
                <section className="roadmap-selected-feature">
                  <header>
                    <h4>Feature details</h4>
                    <button
                      type="button"
                      aria-label="Close feature details"
                      onClick={() => setSelectedId(null)}
                    >
                      <X size={14} />
                    </button>
                  </header>
                  <span className="roadmap-feature-id">#{selected.task.id}</span>
                  <b>{selected.task.title}</b>
                  <span className="roadmap-week-chip">{weekLabel(selected.task.due_date)}</span>
                  <p>
                    {shortDate(selected.task.planned_start_date)} →{" "}
                    {shortDate(selected.task.due_date)}
                  </p>
                  <p>{statusLabel(selected.task.status)}</p>
                  {selected.task.description && <p>{selected.task.description}</p>}
                  <h5>User story progress</h5>
                  <p>
                    {selected.task.story_progress?.completed ?? 0}/
                    {selected.task.story_progress?.total ?? 0} complete ·{" "}
                    {selected.task.story_progress?.percent ?? 0}%
                  </p>
                  <button
                    type="button"
                    className="roadmap-button"
                    onClick={() => setTab("stories")}
                  >
                    View user stories
                  </button>
                  <h5>Depends on</h5>
                  {selected.task.blocked_by.length ? (
                    selected.task.blocked_by.map((id) => (
                      <p key={id}>
                        {tasks.find((task) => task.id === id)?.title ??
                          `Work item #${id} (outside this project)`}
                      </p>
                    ))
                  ) : (
                    <p>No predecessors</p>
                  )}
                  <button
                    type="button"
                    className="roadmap-button"
                    disabled={!canWrite}
                    onClick={() => setEditing(selected.task)}
                  >
                    <Pencil size={13} />
                    Edit feature
                  </button>
                </section>
              )}
              <section className="roadmap-critical-list">
                <h4>
                  <Flag size={14} />
                  Critical path
                </h4>
                {plan.completeSchedule ? (
                  plan.nodes
                    .filter((node) => node.critical)
                    .map((node) => (
                      <button
                        key={node.task.id}
                        type="button"
                        onClick={() => setSelectedId(node.task.id)}
                      >
                        <span>#{node.task.id}</span>
                        {node.task.title}
                      </button>
                    ))
                ) : (
                  <p>
                    Add start and delivery dates to every visible feature and include all
                    predecessors to calculate the critical path.
                  </p>
                )}
                <small>
                  CPM uses calendar-day durations and finish-to-start dependencies. Delivery weeks
                  use ISO weeks.
                </small>
              </section>
            </aside>
          </div>
        </>
      )}
      {editing !== undefined && (
        <RoadmapFeatureDialog
          feature={editing}
          tasks={tasks}
          initialStartDate={newFeatureStart}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
    </section>
  );
}

function Insight({
  icon: Icon,
  label,
  value,
  critical = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div className={`roadmap-insight ${critical ? "critical" : ""}`}>
      <Icon size={19} />
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
    </div>
  );
}
function DependencyTable({
  plan,
  tasks,
  onSelect,
}: {
  plan: RoadmapPlan;
  tasks: Task[];
  onSelect: (id: number) => void;
}) {
  const edges = plan.nodes.flatMap((node) =>
    node.task.blocked_by.map((id) => ({
      predecessor: tasks.find((task) => task.id === id),
      predecessorId: id,
      successor: node.task,
    })),
  );
  return (
    <div className="roadmap-table-scroll">
      <table className="roadmap-feature-table">
        <thead>
          <tr>
            <th>Predecessor</th>
            <th>Relationship</th>
            <th>Successor</th>
            <th>Expected week</th>
            <th>Schedule check</th>
          </tr>
        </thead>
        <tbody>
          {edges.map(({ predecessor, predecessorId, successor }) => (
            <tr key={`${predecessorId}-${successor.id}`}>
              <td>{predecessor?.title ?? `Work item #${predecessorId} (outside this project)`}</td>
              <td>
                <span className="roadmap-muted">Finish → Start</span>
              </td>
              <td>
                <button
                  type="button"
                  className="roadmap-table-name"
                  onClick={() => onSelect(successor.id)}
                >
                  {successor.title}
                </button>
              </td>
              <td>{weekLabel(successor.due_date)}</td>
              <td>
                {predecessor?.due_date &&
                successor.planned_start_date &&
                predecessor.due_date >= successor.planned_start_date ? (
                  <span className="roadmap-overlap">Dates overlap</span>
                ) : predecessor?.due_date && successor.planned_start_date ? (
                  "In sequence"
                ) : (
                  "Dates incomplete"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!edges.length && (
        <p className="roadmap-empty">
          No dependencies yet. Edit a feature and choose its predecessors.
        </p>
      )}
    </div>
  );
}
