import type { Project } from "../../entities/project";
import ProjectCard from "../../features/projects/components/ProjectCard";

type Props = {
  projects: Project[];
  onOpen: (projectId: number) => void;
  onToggleDefault: (project: Project) => void;
};

export function ProjectListSection({ projects, onOpen, onToggleDefault }: Props) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} onOpen={() => onOpen(project.id)} onToggleDefault={() => onToggleDefault(project)} />)}</div>;
}
