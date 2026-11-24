import type { Project } from "../../../common/entities/project";
import { WorkProjectItem } from "./WorkProjectItem";
import { WorkProjectsEmptyState } from "./WorkProjectsEmptyState";
export function WorkProjectsList({
  projects,
}: {
  projects: { project: Project; open: number; completed: number }[];
}) {
  return (
    <ul className="my-work-list">
      {projects.map((item) => (
        <WorkProjectItem key={item.project.id} {...item} />
      ))}
      {!projects.length && <WorkProjectsEmptyState />}
    </ul>
  );
}
