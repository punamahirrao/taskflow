import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCheck, Clock3, Gauge } from "lucide-react";
import { getSprints } from "../features/tasks/api/sprints";
import type { Sprint } from "../features/tasks/entities/task";
import { BoardMetric } from "./components/BoardMetric";
import { SprintInsightsPanel } from "./components/SprintInsightsPanel";
import { SprintProgressCharts } from "./components/SprintProgressCharts";
import { useAgileProjectScope } from "../common/features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../features/tasks/hooks/useAgileTasks";
import { averageDays } from "../common/features/agile/utils/boardView";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import type { StatusCount, StatusDefinition } from "./entities/reports";

export default function ReportsPage() {
  const { t } = useTranslation();
  const scope = useAgileProjectScope();
  const agile = useAgileTasks(scope.projectId);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    void getSprints(scope.projectId)
      .then((result) => {
        if (live) setSprints(result);
      })
      .catch(() => {
        if (live) setSprints([]);
      });
    return () => {
      live = false;
    };
  }, [scope.projectId]);

  const completedRecently = agile.tasks.filter(
    (task) => task.completed_at && now - Date.parse(task.completed_at) <= 7 * 86400000,
  ).length;
  const cycleDays = averageDays(
    agile.tasks
      .filter((task) => task.started_at && task.completed_at)
      .map((task) => Date.parse(task.completed_at!) - Date.parse(task.started_at!)),
  );
  const leadDays = averageDays(
    agile.tasks
      .filter((task) => task.created_at && task.completed_at)
      .map((task) => Date.parse(task.completed_at!) - Date.parse(task.created_at!)),
  );
  const overdue = agile.tasks.filter(
    (task) =>
      task.status !== "done" &&
      task.due_date &&
      task.due_date < new Date(now).toISOString().slice(0, 10),
  ).length;
  const inProgress = agile.tasks.filter((task) => task.status === "in_progress").length;
  const blocked = agile.tasks.filter(
    (task) =>
      task.blocked ||
      task.blocked_by.some((id) =>
        agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
      ),
  ).length;
  const statusCounts = useMemo(() => {
    const known: StatusDefinition[] = [
      { label: t("reports.statusBacklog"), key: "backlog", color: "bg-slate-400" },
      { label: t("reports.statusTodo"), key: "todo", color: "bg-indigo-400" },
      { label: t("reports.statusInProgress"), key: "in_progress", color: "bg-sky-500" },
      { label: t("reports.statusReview"), key: "review", color: "bg-amber-500" },
      { label: t("reports.statusWaiting"), key: "waiting", color: "bg-orange-500" },
      { label: t("reports.statusDone"), key: "done", color: "bg-emerald-500" },
    ];
    const extras = [...new Set(agile.tasks.map((task) => task.status))]
      .filter((status) => !known.some(({ key }) => key === status))
      .sort();
    const colors = ["bg-fuchsia-500", "bg-cyan-500", "bg-lime-500", "bg-rose-500"];
    return [
      ...known,
      ...extras.map((status, index): StatusDefinition => ({
        label: status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        key: status,
        color: colors[index % colors.length],
      })),
    ].map(({ label, key, color }): StatusCount => ({
      label,
      count: agile.tasks.filter((task) => task.status === key).length,
      color,
    }));
  }, [agile.tasks, t]);
  const totalTasks = agile.tasks.length;

  return (
    <main data-testid="page-reports" className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">
              {t("reports.eyebrow")}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {t("reports.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{t("reports.subtitle")}</p>
          </div>
        </header>
        {agile.error && (
          <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {agile.error}
          </p>
        )}
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
          aria-label={t("reports.metricsAria")}
        >
          <BoardMetric
            label={t("reports.completedLabel")}
            value={completedRecently}
            note={t("reports.completedNote")}
            icon={<CheckCheck size={16} />}
            tint="green"
          />
          <BoardMetric
            label={t("reports.cycleTimeLabel")}
            value={
              cycleDays === null
                ? t("reports.noValue")
                : t("reports.daysValue", { count: cycleDays })
            }
            note={t("reports.cycleTimeNote")}
            icon={<Clock3 size={16} />}
          />
          <BoardMetric
            label={t("reports.leadTimeLabel")}
            value={
              leadDays === null ? t("reports.noValue") : t("reports.daysValue", { count: leadDays })
            }
            note={t("reports.leadTimeNote")}
            icon={<Activity size={16} />}
            tint="blue"
          />
          <BoardMetric
            label={t("reports.inProgressLabel")}
            value={inProgress}
            note={t("reports.inProgressNote")}
            icon={<Gauge size={16} />}
            tint="blue"
          />
          <BoardMetric
            label={t("reports.overdueBlockedLabel")}
            value={`${overdue} / ${blocked}`}
            note={t("reports.overdueBlockedNote")}
            icon={<AlertTriangle size={16} />}
            tint={overdue || blocked ? "rose" : "green"}
          />
        </section>

        <section
          className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          aria-label={t("reports.workByStatus")}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{t("reports.workByStatus")}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {scope.projectId
                  ? t("reports.distributionSelected")
                  : t("reports.distributionAccessible")}
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {t("reports.itemsCount", { count: totalTasks })}
            </span>
          </div>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {statusCounts.map(
              (status) =>
                status.count > 0 && (
                  <span
                    key={status.label}
                    className={status.color}
                    style={{ width: `${(status.count / Math.max(totalTasks, 1)) * 100}%` }}
                    title={t("reports.statusCountTitle", {
                      label: status.label,
                      count: status.count,
                    })}
                  />
                ),
            )}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {statusCounts.map((status) => (
              <div
                key={status.label}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
              >
                <i className={`h-2.5 w-2.5 rounded-full ${status.color}`} />
                <span className="text-xs text-slate-600">{status.label}</span>
                <span className="ml-auto text-xs font-bold text-slate-800">{status.count}</span>
              </div>
            ))}
          </div>
        </section>

        <SprintProgressCharts tasks={agile.tasks} sprints={sprints} />
        <div className="mt-5">
          <SprintInsightsPanel tasks={agile.tasks} sprints={sprints} />
        </div>
        {agile.loading && (
          <p role="status" className="mt-4 text-xs text-slate-400">
            {t("reports.updating")}
          </p>
        )}
      </div>
    </main>
  );
}
