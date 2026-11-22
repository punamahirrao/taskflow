import { ArrowUpRight } from "lucide-react";
import type { ProjectDirectoryEntry } from "../api/projects";
import { ProjectOwner } from "../components/ProjectOwner";
import { ProjectCardStatus } from "../Projects.styles";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

export function OrganizationProjectCard({
  project,
  onRequest,
  onOpen,
}: {
  project: ProjectDirectoryEntry;
  onRequest: () => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const status = project.status ?? "in_progress";
  return (
    <article className="organization-project-card" aria-label={project.name}>
      <h3>{project.name}</h3>
      <p className="organization-project-description">
        {project.description || "No description provided."}
      </p>
      <div className="organization-project-meta">
        <ProjectCardStatus $status={status}>
          {t(
            status === "archived"
              ? "projects.statusArchived"
              : status === "upcoming"
                ? "projects.statusUpcoming"
                : "projects.statusInProgress",
          )}
        </ProjectCardStatus>
        {project.end_date ? (
          <time dateTime={project.end_date}>
            Target{" "}
            {new Date(`${project.end_date}T12:00:00`).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        ) : (
          <span>No target date</span>
        )}
      </div>
      <div className="organization-project-footer">
        <ProjectOwner owner={project.owner_details} />
        {project.has_access ? (
          <button type="button" className="project-text-link" onClick={onOpen}>
            Open project <ArrowUpRight size={14} />
          </button>
        ) : project.access_request_status === "pending" ? (
          <span className="project-request-pending" role="status">
            Request pending
          </span>
        ) : (
          <button
            type="button"
            className="project-text-link"
            onClick={onRequest}
            aria-label={`Request access to ${project.name}`}
          >
            Request access <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </article>
  );
}
