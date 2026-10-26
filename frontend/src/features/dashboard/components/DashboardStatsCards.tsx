import { CircleCheck, Clock, FolderKanban, TrendingUp } from "lucide-react";
import type { DashboardStats } from "../hooks/useDashboardStats";

const cards = [
  { title: "Total Projects", key: "totalProjects", detail: "Projects in your workspace", icon: FolderKanban, iconClass: "bg-indigo-600", detailClass: "text-indigo-600" },
  { title: "Tasks Completed", key: "completedTasks", detail: "Tasks marked as done", icon: CircleCheck, iconClass: "bg-emerald-500", detailClass: "text-emerald-600" },
  { title: "Pending Tasks", key: "pendingTasks", detail: "To do and in progress", icon: Clock, iconClass: "bg-amber-500", detailClass: "text-amber-600" },
  { title: "Task Completion Rate", key: "completionRate", detail: "Completed / total tasks", icon: TrendingUp, iconClass: "bg-purple-600", detailClass: "text-purple-600" },
] as const;

export function DashboardStatsCards({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  return (
    <section aria-label="Workspace summary" aria-busy={loading}>
      {loading && <p role="status" className="sr-only">Loading dashboard statistics...</p>}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, key, detail, icon: Icon, iconClass, detailClass }) => {
          const value = stats?.[key];
          return <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div className="min-w-0">
              <dt className="text-sm text-slate-500">{title}</dt>
              <dd className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {loading ? <span aria-hidden="true" className="block h-9 w-16 animate-pulse rounded bg-slate-100" /> : key === "completionRate" && value !== undefined ? `${value}%` : value ?? "Unavailable"}
              </dd>
            </div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${iconClass}`}><Icon size={20} aria-hidden="true" /></span></div>
            <p className={`mt-3 text-xs font-medium ${detailClass}`}>{detail}</p>
          </div>;
        })}
      </dl>
    </section>
  );
}
