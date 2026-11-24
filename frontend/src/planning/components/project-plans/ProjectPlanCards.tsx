import { CalendarDays, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import type { useOrganizationSectionPageModel } from "../../features/project-plans/useOrganizationSectionPageModel";

export function ProjectPlanCards({
  model,
}: {
  model: ReturnType<typeof useOrganizationSectionPageModel>;
}) {
  const { projects } = model;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={`/project/${project.id}`}
          className="rounded-xl border border-line bg-surface p-6 hover:border-accent"
        >
          <FolderKanban size={22} className="mb-4 text-accent" />
          <h2 className="text-sm font-semibold">{project.name}</h2>
          <p className="mt-2 text-xs text-muted">
            {project.description || "Open this project to explore its plan."}
          </p>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <CalendarDays size={14} />
            {project.expected_start_date ?? "Start not scheduled"} →{" "}
            {project.end_date ?? "End not scheduled"}
          </p>
        </Link>
      ))}
    </div>
  );
}
