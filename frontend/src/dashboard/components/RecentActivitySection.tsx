import { ArrowRight, MessageCircle } from "lucide-react";
import { sampleActivity } from "../utils/sampleDashboard";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

const ACTIVITY_TONES = { info: "bg-info-soft text-info", danger: "bg-danger-soft text-danger", warning: "bg-warning-soft text-warning", accent: "bg-accent/10 text-accent" } as const;

export function RecentActivitySection() {
  const { t } = useTranslation();
  return <section aria-labelledby="recent-activity-title" className="rounded-2xl border border-line bg-surface p-5 shadow-sm md:p-6">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 id="recent-activity-title" className="text-lg font-semibold tracking-tight text-content">{t("dashboard.recentActivity")}</h2><button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover">{t("dashboard.viewAllActivity")} <ArrowRight size={16} aria-hidden="true" /></button></div>
    <ul className="divide-y divide-line">{sampleActivity.map((activity) => <li key={activity.name} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
      <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${ACTIVITY_TONES[activity.tone]}`}>{activity.initials}</span>
      <div className="min-w-0 flex-1"><p className="text-sm leading-5 text-muted"><span className="font-semibold text-content">{activity.name}</span> {activity.action} <span className="font-semibold text-content">{activity.project}</span></p>
        {"note" in activity && <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-muted"><MessageCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />{activity.note}</p>}
      </div><time className="shrink-0 pt-0.5 text-right text-xs text-slate-400">{activity.time}</time>
    </li>)}</ul>
  </section>;
}
