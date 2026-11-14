import "./dashboard.css";
import { DashboardStatsCards } from "./features/components/DashboardStatsCards";
import { useDashboardStats } from "./features/hooks/useDashboardStats";
import { MyProjectsSection } from "./sections/MyProjectsSection";
import { RecentActivitySection } from "./sections/RecentActivitySection";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";

export default function DashboardPage() {
  const { stats, loading, error, retry } = useDashboardStats();
  const { t } = useTranslation();

  return <main data-testid="page-dashboard" className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">{t("dashboard.welcome")}</p></div>
      </header>
      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={retry} className="rounded-md px-3 py-1 font-semibold hover:bg-red-100">{t("common.tryAgain")}</button></div>}
      <DashboardStatsCards stats={stats} loading={loading} />
      <div className="mt-7 grid gap-5 xl:grid-cols-2"><MyProjectsSection /><RecentActivitySection /></div>
    </div>
  </main>;
}
