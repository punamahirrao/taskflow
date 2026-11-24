import ProjectCard from "./ProjectCard";
import type { Project } from "../../../common/entities/project";
import { AssignedProjectsPanel } from "../../components/assigned-projects/AssignedProjectsPanel";
import { AssignedProjectsHeader } from "../../components/assigned-projects/AssignedProjectsHeader";
import { AssignedProjectsGrid } from "../../components/assigned-projects/AssignedProjectsGrid";
import { AssignedProjectsMore } from "../../components/assigned-projects/AssignedProjectsMore";
import { AssignedProjectsEmptyState } from "../../components/assigned-projects/AssignedProjectsEmptyState";

export function AssignedProjects({
  projects,
  hasAssignedProjects,
  loading,
  error,
  limit,
  onMore,
  onOpen,
  onToggleDefault,
}: {
  projects: Project[];
  hasAssignedProjects: boolean;
  loading: boolean;
  error: string;
  limit: number;
  onMore: () => void;
  onOpen: (id: number) => void;
  onToggleDefault: (project: Project) => Promise<void>;
}) {
  const visibleProjects = projects.slice(0, limit);
  return (
    <AssignedProjectsPanel>
      <AssignedProjectsHeader count={projects.length} />
      {!loading &&
        !error &&
        (projects.length ? (
          <>
            <AssignedProjectsGrid>
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => onOpen(project.id)}
                  onToggleDefault={() => void onToggleDefault(project)}
                />
              ))}
            </AssignedProjectsGrid>
            {projects.length > limit && <AssignedProjectsMore onMore={onMore} />}
          </>
        ) : (
          <AssignedProjectsEmptyState hasAssignedProjects={hasAssignedProjects} />
        ))}
    </AssignedProjectsPanel>
  );
}
