import { Clock, Star } from "lucide-react";
import type { Project } from "../../../common/entities/project";
import type { LanguageContextValue } from "../../../common/shared/i18n/context/LanguageContext";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ProjectTimeLeft } from "../../entities/projects";
import MemberAvatars from "./MemberAvatars";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onToggleDefault: () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function timeLeft(endDate: string | null | undefined, t: LanguageContextValue["t"]): ProjectTimeLeft {
  if (!endDate) return { label: t("projects.card.noEndDate"), urgent: false };
  const [year, month, day] = endDate.split("-").map(Number);
  const today = new Date();
  const days = Math.round((new Date(year, month - 1, day).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / DAY_MS);
  if (days < 0) return { label: t(-days === 1 ? "projects.card.dayPastEnd" : "projects.card.daysPastEnd", { count: -days }), urgent: true };
  if (days === 0) return { label: t("projects.card.endsToday"), urgent: true };
  if (days < 7) return { label: t(days === 1 ? "projects.card.dayUntilEnd" : "projects.card.daysUntilEnd", { count: days }), urgent: true };
  const weeks = Math.round(days / 7);
  return { label: t(weeks === 1 ? "projects.card.weekLeft" : "projects.card.weeksLeft", { count: weeks }), urgent: false };
}

function ProjectCard({ project, onOpen, onToggleDefault }: ProjectCardProps) {
  const { t } = useTranslation();
  const isDefault = Boolean(project.is_default);
  const progress = project.progress ?? 0;
  const due = timeLeft(project.end_date, t);
  const initial = project.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="relative">
      <div
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
        role="button"
        tabIndex={0}
        className="flex h-full cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        <div className="flex items-start gap-3 pr-9">
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-lg font-bold text-cyan-600">{initial}</span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">{project.name}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
              <span>{t("projects.card.projectNumber", { id: project.id })}</span>
                            {isDefault && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{t("projects.card.default")}</span>}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-sm text-gray-600">
          {project.description || t("projects.card.noDescription")}
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm text-gray-600">          <span>{t("projects.card.progress")}</span><span>{progress}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={t("projects.card.progressAria", { name: project.name })} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${due.urgent ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"}`}>
            <Clock size={14} aria-hidden="true" />{due.label}
          </span>
          {project.members && project.members.length > 0 && <MemberAvatars members={project.members} />}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleDefault}
        aria-pressed={isDefault}
        aria-label={isDefault ? t("projects.card.removeDefaultAria", { name: project.name }) : t("projects.card.setDefaultAria", { name: project.name })}
                title={isDefault ? t("projects.card.defaultTitle") : t("projects.card.setDefaultTitle")}
        className="absolute right-3 top-3 cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        <Star size={18} aria-hidden="true" className={isDefault ? "fill-amber-400 text-amber-500" : ""} />
      </button>
    </div>
  );
}

export default ProjectCard;
