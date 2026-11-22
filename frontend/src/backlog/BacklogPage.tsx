import { useEffect, useMemo, useState } from "react";
import { Check, CircleHelp, Layers3, Plus, CalendarClock, Sparkles } from "lucide-react";
import { getSprints } from "../features/tasks/api/sprints";
import type { Sprint } from "../features/tasks/entities/task";
import { useAgileProjectScope } from "../common/features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../features/tasks/hooks/useAgileTasks";
import { QuickCaptureDialog } from "./components/QuickCaptureDialog";
import { EditWorkItemDialog } from "../features/tasks/components/EditWorkItemDialog";
import { BacklogMetric } from "./components/BacklogMetric";
import { BacklogWorkList } from "./components/BacklogWorkList";
import { BacklogControls, type BacklogMode } from "./components/BacklogControls";
import {
  groupBacklogTasks,
  priorityOrder,
  type BacklogGroupBy,
} from "./features/agile/utils/backlog";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";

export default function BacklogPage() {
  const { t } = useTranslation();
  const scope = useAgileProjectScope();
  const agile = useAgileTasks(scope.projectId);
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
        .filter(
          (task) =>
            task.status === "backlog" &&
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
  const staleItems = backlog.filter(
    (task) =>
      asOf - Date.parse(task.updated_at ?? task.created_at ?? new Date(asOf).toISOString()) >
      14 * 86400000,
  );
  const missingEstimate = backlog.filter((task) => !task.estimate.trim());
  const blockedItems = backlog.filter(
    (task) =>
      task.blocked ||
      task.blocked_by.some((id) =>
        agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
      ),
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

  return (
    <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {t("backlog.title")}
            </h2>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={() => setCaptureOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <Plus size={16} /> {t("backlog.captureIdea")}
            </button>
          </div>
        </header>

        <section
          className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          aria-label={t("backlog.healthLabel")}
        >
          <BacklogMetric
            label={t("backlog.metricIdeasInPipeline")}
            value={agile.tasks.filter((task) => task.status === "backlog").length}
            icon={<Layers3 size={16} />}
          />
          <BacklogMetric
            label={t("backlog.metricReadyForSprint")}
            value={
              agile.tasks.filter((task) => task.status === "backlog" && task.ready_for_sprint)
                .length
            }
            icon={<Check size={16} />}
            tint="green"
          />
          <BacklogMetric
            label={t("backlog.metricNeedsEstimate")}
            value={missingEstimate.length}
            icon={<CircleHelp size={16} />}
            tint="amber"
          />
          <BacklogMetric
            label={t("backlog.metricBlocked")}
            value={blockedItems.length}
            icon={<Sparkles size={16} />}
            tint="rose"
          />
          <BacklogMetric
            label={t("backlog.metricStale")}
            value={staleItems.length}
            icon={<CalendarClock size={16} />}
            tint="amber"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <BacklogControls
            mode={mode}
            setMode={setMode}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            search={search}
            setSearch={setSearch}
          />
          {agile.isReordering && (
            <p role="status" className="sr-only">
              Saving backlog order…
            </p>
          )}
          {agile.error && (
            <p
              role="alert"
              className="border-b border-slate-100 bg-rose-50 px-5 py-2.5 text-sm text-rose-700"
            >
              {agile.error}
            </p>
          )}

          <BacklogWorkList
            loading={agile.loading}
            backlog={backlog}
            tasks={agile.tasks}
            projects={scope.projects}
            groups={grouped}
            activeSprint={activeSprint}
            sprintBusy={false}
            epicRollups={epicRollups}
            onCapture={() => setCaptureOpen(true)}
            onReorder={(taskIds) => void agile.reorder(taskIds)}
            reordering={agile.isReordering}
            onUpdate={agile.update}
            onEdit={setEditingTaskId}
          />
        </section>
        {captureOpen && (
          <QuickCaptureDialog
            projects={scope.projects}
            defaultProjectId={scope.projectId}
            onClose={() => setCaptureOpen(false)}
            onCreated={(task) => agile.setTasks((current) => [...current, task])}
          />
        )}
        {editingTask && editingProject && (
          <EditWorkItemDialog
            task={editingTask}
            project={editingProject}
            candidates={agile.tasks}
            onClose={() => setEditingTaskId(null)}
            onSave={(changes) => agile.update(editingTask.id, changes)}
          />
        )}
      </div>
    </main>
  );
}
