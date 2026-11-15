import { Clock, Star } from "lucide-react";
import type { Project } from "../../common/entities/project";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { timeLeft } from "../utils/timeLeft";
import MemberAvatars from "../components/MemberAvatars";
import {
  ProjectCardAvatar,
  ProjectCardDefaultBadge,
  ProjectCardDescription,
  ProjectCardDue,
  ProjectCardFooter,
  ProjectCardFrame,
  ProjectCardHeading,
  ProjectCardHeadingContent,
  ProjectCardNumber,
  ProjectCardProgressFill,
  ProjectCardProgressLabel,
  ProjectCardProgressName,
  ProjectCardProgressSection,
  ProjectCardProgressTrack,
  ProjectCardProgressValue,
  ProjectCardStatus,
  ProjectCardSurface,
} from "../Projects.styles";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onToggleDefault: () => void;
}

function ProjectCard({ project, onOpen, onToggleDefault }: ProjectCardProps) {
  const { t } = useTranslation();
  const isDefault = Boolean(project.is_default);
  const progress = project.progress ?? 0;
  const due = timeLeft(project.end_date, t);
  const initial = project.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <ProjectCardFrame>
      <ProjectCardSurface
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <ProjectCardHeading>
          <ProjectCardAvatar aria-hidden="true">{initial}</ProjectCardAvatar>
          <ProjectCardHeadingContent>
            <h2 className="truncate text-base font-semibold text-gray-900">{project.name}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
              <ProjectCardNumber>{t("projects.card.projectNumber", { id: project.id })}</ProjectCardNumber>
              {isDefault && <ProjectCardDefaultBadge>{t("projects.card.default")}</ProjectCardDefaultBadge>}
            </p>
          </ProjectCardHeadingContent>
        </ProjectCardHeading>

        <ProjectCardDescription>
          {project.description || t("projects.card.noDescription")}
        </ProjectCardDescription>
        <ProjectCardStatus $status={project.status}>
          {t(project.status === "archived" ? "projects.statusArchived" : project.status === "upcoming" ? "projects.statusUpcoming" : "projects.statusInProgress")}
        </ProjectCardStatus>

        <ProjectCardProgressSection>
          <ProjectCardProgressLabel><ProjectCardProgressName>{t("projects.card.progress")}</ProjectCardProgressName><ProjectCardProgressValue>{progress}%</ProjectCardProgressValue></ProjectCardProgressLabel>
          <ProjectCardProgressTrack role="progressbar" aria-label={t("projects.card.progressAria", { name: project.name })} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <ProjectCardProgressFill style={{ width: `${progress}%` }} />
          </ProjectCardProgressTrack>
        </ProjectCardProgressSection>

        <ProjectCardFooter>
          <ProjectCardDue $urgent={due.urgent}>
            <Clock size={14} aria-hidden="true" />{due.label}
          </ProjectCardDue>
          {project.members && project.members.length > 0 && <MemberAvatars members={project.members} />}
        </ProjectCardFooter>
      </ProjectCardSurface>
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
    </ProjectCardFrame>
  );
}

export default ProjectCard;
