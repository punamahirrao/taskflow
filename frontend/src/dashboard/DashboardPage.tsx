import "./dashboard.css";
import { DashboardOverviewFeature } from "./features/DashboardOverviewFeature";
import { useDashboardStats } from "./features/hooks/useDashboardStats";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { DashboardPageHeader, DashboardPageShell } from "./DashboardPage.styles";

export default function DashboardPage() {
  const { stats, loading, error, retry } = useDashboardStats();
  const { t } = useTranslation();

  return <DashboardPageShell data-testid="page-dashboard">
    <div className="mx-auto max-w-7xl">
      <DashboardPageHeader>
        <div><p className="text-sm text-muted">{t("dashboard.welcome")}</p></div>
      </DashboardPageHeader>
      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-danger-soft p-4 text-sm text-danger"><p>{error}</p><button type="button" onClick={retry} className="rounded-md px-3 py-1 font-semibold hover:bg-subtle">{t("common.tryAgain")}</button></div>}
      <DashboardOverviewFeature stats={stats} loading={loading} />
    </div>
  </DashboardPageShell>;
}
