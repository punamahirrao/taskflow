import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCheck, Clock3, Gauge } from "lucide-react";
import { getSprints } from "../api/tasks";
import type { Sprint } from "../entities/task";
import { AgileProjectFilter } from "../features/agile/components/AgileProjectFilter";
import { BoardMetric } from "../features/agile/components/BoardMetric";
import { SprintInsightsPanel } from "../features/agile/components/SprintInsightsPanel";
import { SprintProgressCharts } from "../features/agile/components/SprintProgressCharts";
import { useAgileProjectScope } from "../features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../features/agile/hooks/useAgileTasks";
import { averageDays } from "../features/agile/utils/boardView";

export default function ReportsPage() {
  const scope = useAgileProjectScope("reports_project_scope");
  const agile = useAgileTasks(scope.projectId);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    void getSprints(scope.projectId).then((result) => { if (live) setSprints(result); }).catch(() => { if (live) setSprints([]); });
    return () => { live = false; };
  }, [scope.projectId]);

  const completedRecently = agile.tasks.filter((task) => task.completed_at && now - Date.parse(task.completed_at) <= 7 * 86400000).length;
  const cycleDays = averageDays(agile.tasks.filter((task) => task.started_at && task.completed_at).map((task) => Date.parse(task.completed_at!) - Date.parse(task.started_at!)));
  const leadDays = averageDays(agile.tasks.filter((task) => task.created_at && task.completed_at).map((task) => Date.parse(task.completed_at!) - Date.parse(task.created_at!)));
  const overdue = agile.tasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < new Date(now).toISOString().slice(0, 10)).length;
  const inProgress = agile.tasks.filter((task) => task.status === "in_progress").length;
  const blocked = agile.tasks.filter((task) => task.blocked || task.blocked_by.some((id) => agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"))).length;
  const statusCounts = useMemo(() => {
    const known = [
      ["Backlog", "backlog", "bg-slate-400"], ["To Do", "todo", "bg-indigo-400"], ["In Progress", "in_progress", "bg-sky-500"],
      ["Review", "review", "bg-amber-500"], ["Waiting", "waiting", "bg-orange-500"], ["Done", "done", "bg-emerald-500"],
    ];
    const extras = [...new Set(agile.tasks.map((task) => task.status))].filter((status) => !known.some(([, key]) => key === status)).sort();
    const colors = ["bg-fuchsia-500", "bg-cyan-500", "bg-lime-500", "bg-rose-500"];
    return [...known, ...extras.map((status, index) => [status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), status, colors[index % colors.length]])]
      .map(([label, key, color]) => ({ label, count: agile.tasks.filter((task) => task.status === key).length, color }));
  }, [agile.tasks]);
  const totalTasks = agile.tasks.length;

  return <main data-testid="page-reports" className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8"><div className="mx-auto max-w-[1440px]">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Delivery insights</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Reports</h2><p className="mt-2 text-sm text-slate-500">Track actual project flow, sprint delivery, capacity, and team workload.</p></div><AgileProjectFilter projects={scope.projects} value={scope.projectId} onChange={scope.selectProject} /></header>
    {agile.error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{agile.error}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Delivery metrics">
      <BoardMetric label="Completed · 7 days" value={completedRecently} note="Work items recently delivered" icon={<CheckCheck size={16} />} tint="green" />
      <BoardMetric label="Cycle time" value={cycleDays === null ? "—" : `${cycleDays}d`} note="In progress to done · average" icon={<Clock3 size={16} />} />
      <BoardMetric label="Lead time" value={leadDays === null ? "—" : `${leadDays}d`} note="Created to done · average" icon={<Activity size={16} />} tint="blue" />
      <BoardMetric label="In progress" value={inProgress} note="Current work in motion" icon={<Gauge size={16} />} tint="blue" />
      <BoardMetric label="Overdue / blocked" value={`${overdue} / ${blocked}`} note="Items needing attention" icon={<AlertTriangle size={16} />} tint={overdue || blocked ? "rose" : "green"} />
    </section>

    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Work by status"><div className="flex items-end justify-between gap-4"><div><h2 className="text-sm font-semibold text-slate-900">Work by status</h2><p className="mt-1 text-xs text-slate-500">Current distribution across {scope.projectId ? "the selected project" : "accessible projects"}.</p></div><span className="text-xs font-medium text-slate-500">{totalTasks} items</span></div><div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">{statusCounts.map((status) => status.count > 0 && <span key={status.label} className={status.color} style={{ width: `${status.count / Math.max(totalTasks, 1) * 100}%` }} title={`${status.label}: ${status.count}`} />)}</div><div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{statusCounts.map((status) => <div key={status.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><i className={`h-2.5 w-2.5 rounded-full ${status.color}`} /><span className="text-xs text-slate-600">{status.label}</span><span className="ml-auto text-xs font-bold text-slate-800">{status.count}</span></div>)}</div></section>

    <SprintProgressCharts tasks={agile.tasks} sprints={sprints} />
    <div className="mt-5"><SprintInsightsPanel tasks={agile.tasks} sprints={sprints} /></div>
    {agile.loading && <p role="status" className="mt-4 text-xs text-slate-400">Updating report data…</p>}
  </div></main>;
}
