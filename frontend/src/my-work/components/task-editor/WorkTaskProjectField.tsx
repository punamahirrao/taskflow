import type { Project } from "../../../common/entities/project";
import type { Task } from "../../../features/tasks/entities/task";
export function WorkTaskProjectField({
  task,
  projects,
  projectId,
  onChange,
}: {
  task?: Task;
  projects: Project[];
  projectId: number;
  onChange: (value: number) => void;
}) {
  if (task)
    return (
      <p className="my-work-muted">
        {task.project_name ?? projects.find((project) => project.id === task.project)?.name}
      </p>
    );
  return (
    <label>
      Project
      <select
        required
        value={projectId || ""}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        <option value="" disabled>
          Choose a project
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
