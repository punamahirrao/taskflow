import { ArrowRight, MessageCircle } from "lucide-react";
import { sampleActivity } from "../../features/dashboard/data/sampleDashboard";

export function RecentActivitySection() {
  return <section aria-labelledby="recent-activity-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 id="recent-activity-title" className="text-lg font-semibold tracking-tight text-slate-900">Recent activity</h2><button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">View all activity <ArrowRight size={16} aria-hidden="true" /></button></div>
    <ul className="divide-y divide-slate-100">{sampleActivity.map((activity) => <li key={activity.name} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
      <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activity.color}`}>{activity.initials}</span>
      <div className="min-w-0 flex-1"><p className="text-sm leading-5 text-slate-600"><span className="font-semibold text-slate-800">{activity.name}</span> {activity.action} <span className="font-semibold text-slate-800">{activity.project}</span></p>
        {"note" in activity && <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-slate-500"><MessageCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />{activity.note}</p>}
      </div><time className="shrink-0 pt-0.5 text-right text-xs text-slate-400">{activity.time}</time>
    </li>)}</ul>
  </section>;
}
