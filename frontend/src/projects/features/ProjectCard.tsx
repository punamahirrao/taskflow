import { Clock, Star } from "lucide-react";
import type { Project } from "../../common/entities/project";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { timeLeft } from "../utils/timeLeft";
import { ProjectOwner } from "../components/ProjectOwner";
import {
  ProjectCardAvatar,
  ProjectCardDefaultBadge,
  ProjectCardDescription,
  ProjectCardDue,
  ProjectCardFooter,
  ProjectCardFrame,
  ProjectCardHeading,
  ProjectCardHeadingContent,
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
  const ownerMember = project.members?.find(
    (member) => member.id === project.owner || member.role === "owner",
  );
  const owner =
    project.owner_details ??
    (ownerMember
      ? {
          id: ownerMember.id,
          name: `${ownerMember.first_name} ${ownerMember.last_name}`.trim() || ownerMember.email,
          photo_url: ownerMember.photo_url,
        }
      : null);

  return (
    <ProjectCardFrame>
      <ProjectCardSurface>
        <button
          type="button"
          className="project-card-open"
          onClick={onOpen}
          aria-label={`Open ${project.name}`}
        />
        <ProjectCardHeading>
          <ProjectCardAvatar aria-hidden="true">{initial}</ProjectCardAvatar>
          <ProjectCardHeadingContent>
            <h3 className="truncate text-sm font-semibold">{project.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <ProjectCardStatus $status={project.status}>
                {t(
                  project.status === "archived"
                    ? "projects.statusArchived"
                    : project.status === "upcoming"
                      ? "projects.statusUpcoming"
                      : "projects.statusInProgress",
                )}
              </ProjectCardStatus>
              {isDefault && (
                <ProjectCardDefaultBadge>{t("projects.card.default")}</ProjectCardDefaultBadge>
              )}
            </div>
          </ProjectCardHeadingContent>
        </ProjectCardHeading>

        <ProjectCardDescription>
          {project.description || t("projects.card.noDescription")}
        </ProjectCardDescription>

        <ProjectCardProgressSection>
          <ProjectCardProgressLabel>
            <ProjectCardProgressName>{t("projects.card.progress")}</ProjectCardProgressName>
            <ProjectCardProgressValue>{progress}%</ProjectCardProgressValue>
          </ProjectCardProgressLabel>
          <ProjectCardProgressTrack
            role="progressbar"
            aria-label={t("projects.card.progressAria", { name: project.name })}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <ProjectCardProgressFill style={{ width: `${progress}%` }} />
          </ProjectCardProgressTrack>
        </ProjectCardProgressSection>

        <ProjectCardFooter>
          <ProjectOwner owner={owner} />
          <ProjectCardDue $urgent={due.urgent}>
            <Clock size={14} aria-hidden="true" />
            {due.label}
          </ProjectCardDue>
        </ProjectCardFooter>
      </ProjectCardSurface>
      <button
        type="button"
        onClick={onToggleDefault}
        aria-pressed={isDefault}
        aria-label={
          isDefault
            ? t("projects.card.removeDefaultAria", { name: project.name })
            : t("projects.card.setDefaultAria", { name: project.name })
        }
        title={isDefault ? t("projects.card.defaultTitle") : t("projects.card.setDefaultTitle")}
        className="absolute right-3 top-3 z-10 cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        <Star
          size={18}
          aria-hidden="true"
          className={isDefault ? "fill-amber-400 text-amber-500" : ""}
        />
      </button>
    </ProjectCardFrame>
  );
}

export default ProjectCard;
