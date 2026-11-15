import { CircleCheck, Clock, FolderKanban, TrendingUp } from "lucide-react";
import type { DashboardStats } from "../entities/dashboard";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

const cards = [
  { title: "stats.totalProjects", key: "totalProjects", detail: "stats.totalProjectsDetail", icon: FolderKanban, iconClass: "bg-accent", detailClass: "text-accent" },
  { title: "stats.tasksCompleted", key: "completedTasks", detail: "stats.tasksCompletedDetail", icon: CircleCheck, iconClass: "bg-positive", detailClass: "text-positive" },
  { title: "stats.pendingTasks", key: "pendingTasks", detail: "stats.pendingTasksDetail", icon: Clock, iconClass: "bg-warning", detailClass: "text-warning" },
  { title: "stats.completionRate", key: "completionRate", detail: "stats.completionRateDetail", icon: TrendingUp, iconClass: "bg-info", detailClass: "text-info" },
] as const;

interface DashboardStatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function DashboardStatsCards({ stats, loading }: DashboardStatsCardsProps) {
  const { t } = useTranslation();
  return (
    <section aria-label={t("dashboard.workspaceSummary")} aria-busy={loading}>
      {loading && <p role="status" className="sr-only">{t("dashboard.loadingStats")}</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <DashboardStatCard key={card.key} card={card} value={stats?.[card.key]} loading={loading} />)}
      </div>
    </section>
  );
}

type StatCardDefinition = typeof cards[number];
function DashboardStatCard({ card, value, loading }: { card: StatCardDefinition; value: number | undefined; loading: boolean }) {
  const { t } = useTranslation();
  const Icon = card.icon;
  return <article className="rounded-xl border border-line bg-surface p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div className="min-w-0">
    <p className="text-sm text-muted">{t(card.title)}</p><p className="mt-1 text-3xl font-bold tracking-tight text-content">{loading ? <span aria-hidden="true" className="block h-9 w-16 animate-pulse rounded bg-subtle" /> : card.key === "completionRate" && value !== undefined ? `${value}%` : value ?? t("dashboard.unavailable")}</p>
  </div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${card.iconClass}`}><Icon size={20} aria-hidden="true" /></span></div><p className={`mt-3 text-xs font-medium ${card.detailClass}`}>{t(card.detail)}</p></article>;
}
