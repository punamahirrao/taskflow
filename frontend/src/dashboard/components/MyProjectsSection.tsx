import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sampleProjects } from "../utils/sampleDashboard";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

const TONE_CLASSES = { warning: "bg-warning-soft text-warning", positive: "bg-positive-soft text-positive", info: "bg-info-soft text-info" } as const;

export function MyProjectsSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return <section aria-labelledby="my-projects-title" className="rounded-2xl border border-line bg-surface p-5 shadow-sm md:p-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id="my-projects-title" className="text-lg font-semibold tracking-tight text-content">{t("app.projects")}</h2>
      <button type="button" onClick={() => navigate("/projects")} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"><span>{t("dashboard.viewAllProjects")}</span><ArrowRight size={16} aria-hidden="true" /></button>
    </div>
    <div className="space-y-3">{sampleProjects.map((project) => {
      const Icon = project.icon;
      const tone = project.tone === "warning" ? "warning" : project.tone === "success" ? "positive" : "info";
      const toneClass = TONE_CLASSES[tone];
      return <article key={project.name} className="rounded-xl border border-line p-3 sm:p-4">
        <div className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}><Icon size={20} aria-hidden="true" /></span>
          <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-content">{project.name}</h3><p className="mt-0.5 truncate text-xs text-muted">{project.description}</p></div>
          <span className={`col-start-2 mt-1 w-fit rounded-full px-2.5 py-1 text-xs font-medium sm:col-start-auto sm:mt-0 ${toneClass}`}>{project.status}</span>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:ml-[56px]">
          <div className="h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-label={t("dashboard.projectProgress", { name: project.name })} aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${tone === "warning" ? "bg-warning" : tone === "positive" ? "bg-positive" : "bg-info"}`} style={{ width: `${project.progress}%` }} /></div>
          <div className="flex -space-x-2" aria-label={t("dashboard.team", { people: project.people.join(", ") })}>
            {project.people.map((person) => <span key={person} aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-subtle text-[9px] font-semibold text-content">{person}</span>)}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-subtle text-[9px] font-medium text-muted">+{project.extraPeople}</span>
          </div>
          <span className="text-xs font-medium text-muted">{project.progress}%</span><span className="text-right text-xs text-muted">{project.due}</span>
        </div>
      </article>;
    })}</div>
  </section>;
}
