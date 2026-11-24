import type { DeliverySnapshot } from "../../entities/delivery";
import { ActiveSprintItem } from "./ActiveSprintItem";
import { ActiveSprintsEmptyState } from "./ActiveSprintsEmptyState";

export function ActiveSprintsList({ sprints }: { sprints: DeliverySnapshot["sprints"] }) {
  if (!sprints.length) return <ActiveSprintsEmptyState />;

  return (
    <ul className="delivery-list delivery-sprints">
      {sprints.map((sprint) => (
        <ActiveSprintItem key={sprint.id} sprint={sprint} />
      ))}
    </ul>
  );
}
