import { DashboardStatsCards } from "../components/DashboardStatsCards";
import { MyProjectsSection } from "../components/MyProjectsSection";
import { RecentActivitySection } from "../components/RecentActivitySection";
import type { DashboardStats } from "../entities/dashboard";

export function DashboardOverviewFeature({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  return <><DashboardStatsCards stats={stats} loading={loading} /><div className="mt-7 grid gap-5 xl:grid-cols-2"><MyProjectsSection /><RecentActivitySection /></div></>;
}
