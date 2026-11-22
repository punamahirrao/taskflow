import type { Project } from "../../common/entities/project";
import ProjectCard from "../features/ProjectCard";

interface ProjectListSectionProps {
  projects: Project[];
  onOpen: (projectId: number) => void;
  onToggleDefault: (project: Project) => void;
}

export function ProjectListSection({ projects, onOpen, onToggleDefault }: ProjectListSectionProps) {
  return (
    <div className="project-directory-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={() => onOpen(project.id)}
          onToggleDefault={() => onToggleDefault(project)}
        />
      ))}
    </div>
  );
}
