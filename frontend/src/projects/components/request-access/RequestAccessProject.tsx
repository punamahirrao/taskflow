import type { ProjectDirectoryEntry } from "../../api/projects";
import { ProjectOwner } from "../ProjectOwner";

export function RequestAccessProject({ project }: { project: ProjectDirectoryEntry }) {
  return (
    <>
      <p id="request-access-project" className="mb-3 font-semibold">
        {project.name}
      </p>
      <ProjectOwner owner={project.owner_details} />
    </>
  );
}
