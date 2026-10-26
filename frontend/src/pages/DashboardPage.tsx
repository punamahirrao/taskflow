import { DashboardStatsCards } from "../features/dashboard/components/DashboardStatsCards";
import { useDashboardStats } from "../features/dashboard/hooks/useDashboardStats";
import UserMenu from "../features/profile/components/UserMenu";
import { MyProjectsSection } from "../sections/dashboard/MyProjectsSection";
import { RecentActivitySection } from "../sections/dashboard/RecentActivitySection";

export default function DashboardPage() {
  const { stats, loading, error, retry } = useDashboardStats();

  return <main className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1><p className="mt-2 text-sm text-slate-500">Welcome back! Here's what's happening with your projects today.</p></div>
        <UserMenu />
      </header>
      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={retry} className="rounded-md px-3 py-1 font-semibold hover:bg-red-100">Try again</button></div>}
      <DashboardStatsCards stats={stats} loading={loading} />
      <div className="mt-7 grid gap-5 xl:grid-cols-2"><MyProjectsSection /><RecentActivitySection /></div>
    </div>
  </main>;
}
