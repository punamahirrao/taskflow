import type { Sprint, Task } from "../../common/entities/task";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { SprintProgressRow } from "../entities/reports";

interface SprintProgressChartsProps { tasks: Task[]; sprints: Sprint[] }
interface LegendProps { color: string; label: string }

export function SprintProgressCharts({ tasks, sprints }: SprintProgressChartsProps) {
  const { t } = useTranslation();
  const visible = [...sprints].sort((first, second) => (first.start_date ?? "9999").localeCompare(second.start_date ?? "9999")).slice(-6);
  const rows = visible.map((sprint): SprintProgressRow => {
    const sprintTasks = tasks.filter((task) => task.sprint === sprint.id && task.status !== "backlog");
    const planned = sprintTasks.reduce((sum, task) => sum + points(task), 0);
    const delivered = sprintTasks.filter((task) => task.status === "done").reduce((sum, task) => sum + points(task), 0);
    const capacity = sprint.capacity_points ?? (sprint.is_closed ? sprint.velocity_points : null);
    return { sprint, planned, delivered, capacity };
  });
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.planned, row.delivered, row.capacity ?? 0]));
  const closed = rows.filter((row) => row.sprint.is_closed && row.sprint.velocity_points !== null).slice(-6);
  const maxVelocity = Math.max(1, ...closed.map((row) => row.sprint.velocity_points ?? 0));

  return <section className="mt-5 grid gap-4 xl:grid-cols-2" aria-label={t("reports.sprintChartsAria")}>
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div><h2 className="text-sm font-semibold text-slate-900">{t("reports.deliveryVsCapacity")}</h2><p className="mt-1 text-xs text-slate-500">{t("reports.deliveryVsCapacityNote")}</p></div>
      {rows.length ? <div className="mt-5 space-y-4">{rows.map(({ sprint, planned, delivered, capacity }) => <div key={sprint.id}>
        <div className="mb-1 flex items-center justify-between gap-3"><span className="truncate text-xs font-semibold text-slate-700">{sprint.is_active ? t("reports.sprintActive", { name: sprint.name }) : sprint.is_closed ? t("reports.sprintClosed", { name: sprint.name }) : t("reports.sprintPlanned", { name: sprint.name })}</span><span className="shrink-0 text-[10px] text-slate-500">{capacity !== null ? t("reports.pointsSummaryCapacity", { delivered, planned, capacity }) : t("reports.pointsSummary", { delivered, planned })}</span></div>
        <div className="relative h-5 overflow-hidden rounded-full bg-slate-100"><div className="absolute inset-y-0 left-0 rounded-full bg-indigo-100" style={{ width: `${Math.max(2, planned / maxValue * 100)}%` }} /><div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" style={{ width: `${Math.max(delivered ? 2 : 0, delivered / maxValue * 100)}%` }} />{capacity !== null && <span className="absolute inset-y-0 border-l-2 border-amber-500" style={{ left: `${Math.min(capacity / maxValue * 100, 99)}%` }} title={t("reports.capacityTitle", { capacity })} />}</div>
      </div>)}</div> : <p className="mt-5 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">{t("reports.createSprintHint")}</p>}
      <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-500"><Legend color="bg-indigo-100" label={t("reports.legendPlanned")} /><Legend color="bg-emerald-500" label={t("reports.legendCompleted")} /><Legend color="bg-amber-500" label={t("reports.legendCapacity")} /></div>
    </article>

    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div><h2 className="text-sm font-semibold text-slate-900">{t("reports.velocityTrend")}</h2><p className="mt-1 text-xs text-slate-500">{t("reports.velocityTrendNote")}</p></div>
      {closed.length ? <div className="mt-5 flex h-40 items-end gap-3 border-b border-l border-slate-200 px-2 pb-0">{closed.map(({ sprint }) => {
        const velocity = sprint.velocity_points ?? 0;
        return <div key={sprint.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"><span className="text-[10px] font-semibold text-slate-700">{velocity}</span><div className="w-full max-w-12 rounded-t-md bg-indigo-500" style={{ height: `${Math.max(3, velocity / maxVelocity * 105)}px` }} title={t("reports.velocityTitle", { name: sprint.name, velocity })} /><span className="w-full truncate text-center text-[9px] text-slate-500">{sprint.name}</span></div>;
      })}</div> : <p className="mt-5 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">{t("reports.closedSprintsHint")}</p>}
    </article>
  </section>;
}

function points(task: Task) { const value = Number.parseFloat(task.estimate); return Number.isFinite(value) ? value : 0; }
function Legend({ color, label }: LegendProps) { return <span className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>; }
