import { Globe, Pencil, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../common/entities/project";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface ProjectHeaderProps {
  project: Project;
  completed: number;
  total: number;
  onEdit: () => void;
}

export function ProjectHeader({ project, completed, total, onEdit }: ProjectHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const status = total > 0 && completed === total
    ? { label: t("projectDetail.header.completed"), style: "bg-blue-50 text-blue-700", dot: "bg-blue-500" }
    : total === 0 ? { label: t("projectDetail.header.noTasks"), style: "bg-gray-100 text-gray-600", dot: "bg-gray-400" }
      : { label: t("projectDetail.header.onTrack"), style: "bg-green-50 text-green-700", dot: "bg-green-500" };

  return <header className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
    <div className="flex min-w-0 items-center gap-4"><button type="button" onClick={() => navigate("/dashboard")} aria-label={t("projectDetail.header.backToDashboard")} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Globe size={28} /></button>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h1 className="truncate text-2xl font-bold text-slate-900">{project.name}</h1><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.style}`}><span className={`h-2 w-2 rounded-full ${status.dot}`} />{status.label}</span></div><p className="mt-1 text-sm text-gray-600">{project.description}</p><p className="mt-1 text-xs text-gray-500">{project.expected_start_date ? t("projectDetail.header.expectedStart", { date: formatDate(project.expected_start_date) }) : t("projectDetail.header.startNotSet")} · {project.end_date ? t("projectDetail.header.end", { date: formatDate(project.end_date) }) : t("projectDetail.header.endNotSet")}</p></div>
    </div>
    <div className="flex shrink-0 items-center gap-3">{(project.my_role === "owner" || project.my_role === "admin") && <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800"><Pencil size={16} />{t("projectDetail.header.edit")}</button>}
      {(project.my_role === "owner" || project.my_role === "admin") && <button type="button" onClick={() => navigate(`/project/${project.id}/share`)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"><Share2 size={16} />{t("projectDetail.header.share")}</button>}
    </div>
  </header>;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(year, month - 1, day));
}
