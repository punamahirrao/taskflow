import { ProjectPulseFooter } from "../../components/project-pulse/ProjectPulseFooter";
import { ProjectPulseHeader } from "../../components/project-pulse/ProjectPulseHeader";
import { ProjectPulseNote } from "../../components/project-pulse/ProjectPulseNote";
import { ProjectPulsePanel } from "../../components/project-pulse/ProjectPulsePanel";
import { ProjectPulseTable } from "../../components/project-pulse/ProjectPulseTable";
import type { DeliveryProject } from "../../entities/delivery";

const PROJECT_LIMIT = 5;

export function ProjectPulse({
  projects,
  selectedId,
  onSelect,
}: {
  projects: DeliveryProject[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const sorted = [...projects].sort(
    (a, b) => b.at_risk - a.at_risk || a.name.localeCompare(b.name),
  );
  const visibleProjects = sorted.slice(0, PROJECT_LIMIT);

  return (
    <ProjectPulsePanel>
      <ProjectPulseHeader />
      <ProjectPulseTable projects={visibleProjects} selectedId={selectedId} onSelect={onSelect} />
      {projects.length > PROJECT_LIMIT && (
        <ProjectPulseFooter visibleCount={visibleProjects.length} projectCount={projects.length} />
      )}
      <ProjectPulseNote />
    </ProjectPulsePanel>
  );
}
