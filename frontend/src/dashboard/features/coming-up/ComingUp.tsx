import { ComingUpFooter } from "../../components/coming-up/ComingUpFooter";
import { ComingUpHeader } from "../../components/coming-up/ComingUpHeader";
import { ComingUpList } from "../../components/coming-up/ComingUpList";
import { ComingUpPanel } from "../../components/coming-up/ComingUpPanel";
import type { DeliverySnapshot } from "../../entities/delivery";

const TARGET_LIMIT = 3;

export function ComingUp({ milestones }: { milestones: DeliverySnapshot["milestones"] }) {
  const visibleMilestones = milestones.slice(0, TARGET_LIMIT);

  return (
    <ComingUpPanel>
      <ComingUpHeader />
      <ComingUpList milestones={visibleMilestones} />
      {milestones.length > TARGET_LIMIT && <ComingUpFooter />}
    </ComingUpPanel>
  );
}
