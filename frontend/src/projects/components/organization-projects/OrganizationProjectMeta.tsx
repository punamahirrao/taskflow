import type { Project } from "../../../common/entities/project";
import { ProjectStatusBadge } from "../shared/ProjectStatusBadge";

export function OrganizationProjectMeta({
  status,
  endDate,
}: {
  status: Project["status"];
  endDate?: string | null;
}) {
  return (
    <div className="organization-project-meta">
      <ProjectStatusBadge status={status} />
      {endDate ? (
        <time dateTime={endDate}>
          Target{" "}
          {new Date(`${endDate}T12:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      ) : (
        <span>No target date</span>
      )}
    </div>
  );
}
