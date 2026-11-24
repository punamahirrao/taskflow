import type { DeliverySnapshot } from "../../entities/delivery";
import { ComingUpEmptyState } from "./ComingUpEmptyState";
import { ComingUpItem } from "./ComingUpItem";

export function ComingUpList({ milestones }: { milestones: DeliverySnapshot["milestones"] }) {
  if (!milestones.length) return <ComingUpEmptyState />;

  return (
    <ul className="delivery-list">
      {milestones.map((item) => (
        <ComingUpItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
