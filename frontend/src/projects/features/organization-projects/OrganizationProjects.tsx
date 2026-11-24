import { OrganizationProjectCard } from "./OrganizationProjectCard";
import type { ProjectDirectoryEntry } from "../../api/projects";
import { OrganizationProjectsPanel } from "../../components/organization-projects/OrganizationProjectsPanel";
import { OrganizationProjectsHeader } from "../../components/organization-projects/OrganizationProjectsHeader";
import { OrganizationProjectsLoading } from "../../components/organization-projects/OrganizationProjectsLoading";
import { OrganizationProjectsError } from "../../components/organization-projects/OrganizationProjectsError";
import { OrganizationProjectsEmptyState } from "../../components/organization-projects/OrganizationProjectsEmptyState";
import { OrganizationProjectsGrid } from "../../components/organization-projects/OrganizationProjectsGrid";
import { OrganizationProjectsMore } from "../../components/organization-projects/OrganizationProjectsMore";

export function OrganizationProjects({
  projects,
  loading,
  error,
  assignedLoading,
  assignedError,
  limit,
  onMore,
  onRetry,
  onOpen,
  onRequest,
}: {
  projects: ProjectDirectoryEntry[];
  loading: boolean;
  error: string;
  assignedLoading: boolean;
  assignedError: string;
  limit: number;
  onMore: () => void;
  onRetry: () => void;
  onOpen: (id: number) => void;
  onRequest: (project: ProjectDirectoryEntry) => void;
}) {
  const visibleProjects = projects.slice(0, limit);
  const ready = !loading && !assignedLoading && !error && !assignedError;
  return (
    <OrganizationProjectsPanel>
      <OrganizationProjectsHeader count={projects.length} />
      {loading && <OrganizationProjectsLoading />}
      {error && <OrganizationProjectsError message={error} onRetry={onRetry} />}
      {ready &&
        (projects.length ? (
          <>
            <OrganizationProjectsGrid>
              {visibleProjects.map((project) => (
                <OrganizationProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => onOpen(project.id)}
                  onRequest={() => onRequest(project)}
                />
              ))}
            </OrganizationProjectsGrid>
            {projects.length > limit && <OrganizationProjectsMore onMore={onMore} />}
          </>
        ) : (
          <OrganizationProjectsEmptyState />
        ))}
    </OrganizationProjectsPanel>
  );
}
