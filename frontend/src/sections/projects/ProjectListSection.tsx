import type { Project } from "../../entities/project";
import ProjectCard from "../../features/projects/components/ProjectCard";

export function ProjectListSection({ projects, onOpen }: { projects: Project[]; onOpen: (projectId: number) => void }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{projects.map((project) => <ProjectCard key={project.id} project={project} onOpen={() => onOpen(project.id)} />)}</div>;
}
