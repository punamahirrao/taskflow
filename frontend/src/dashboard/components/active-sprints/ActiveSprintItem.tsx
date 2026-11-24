import { Layers3 } from "lucide-react";
import type { DeliverySnapshot } from "../../entities/delivery";
import { shortDate } from "../../utils/deliveryFormat";
import { DeliveryProgress } from "../DeliveryProgress";

export function ActiveSprintItem({ sprint }: { sprint: DeliverySnapshot["sprints"][number] }) {
  return (
    <li>
      <Layers3 size={17} className="delivery-heading-icon" />
      <div>
        <strong>{sprint.name}</strong>
        <small>
          {sprint.project__name}
          {sprint.end_date ? ` · Ends ${shortDate(sprint.end_date)}` : ""}
        </small>
        {sprint.goal && <p>{sprint.goal}</p>}
        <DeliveryProgress
          done={sprint.done}
          total={sprint.total}
          label={`${sprint.name} completion`}
        />
      </div>
    </li>
  );
}
