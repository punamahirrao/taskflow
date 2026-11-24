import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { DeliveryProject } from "../../entities/delivery";
import { shortDate } from "../../utils/deliveryFormat";
import { DeliveryProgress } from "../DeliveryProgress";
import { ProjectPulseHealth } from "./ProjectPulseHealth";

export function ProjectPulseRow({
  project,
  selected,
  onSelect,
}: {
  project: DeliveryProject;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <tr>
      <th scope="row">
        {selected ? (
          project.name
        ) : (
          <button type="button" className="delivery-link" onClick={() => onSelect(project.id)}>
            {project.name}
          </button>
        )}
      </th>
      <td>
        <ProjectPulseHealth project={project} />
      </td>
      <td>
        <DeliveryProgress
          done={project.done}
          total={project.total}
          label={`${project.name} completion`}
        />
      </td>
      <td>{project.end_date ? shortDate(project.end_date) : "Unscheduled"}</td>
      <td>
        <Link
          className="delivery-open"
          to={`/project/${project.id}`}
          aria-label={`Open ${project.name}`}
        >
          <ArrowUpRight size={16} />
        </Link>
      </td>
    </tr>
  );
}
