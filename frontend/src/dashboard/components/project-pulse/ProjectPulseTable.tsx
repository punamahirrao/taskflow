import type { DeliveryProject } from "../../entities/delivery";
import { ProjectPulseRow } from "./ProjectPulseRow";
import { ProjectPulseTableHead } from "./ProjectPulseTableHead";

export function ProjectPulseTable({
  projects,
  selectedId,
  onSelect,
}: {
  projects: DeliveryProject[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div
      className="delivery-table-scroll"
      role="region"
      aria-label="Project pulse table"
      tabIndex={0}
    >
      <table className="delivery-table">
        <ProjectPulseTableHead />
        <tbody>
          {projects.map((project) => (
            <ProjectPulseRow
              key={project.id}
              project={project}
              selected={selectedId === project.id}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
