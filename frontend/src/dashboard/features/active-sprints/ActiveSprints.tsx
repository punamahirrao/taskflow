import { ActiveSprintsFooter } from "../../components/active-sprints/ActiveSprintsFooter";
import { ActiveSprintsHeader } from "../../components/active-sprints/ActiveSprintsHeader";
import { ActiveSprintsList } from "../../components/active-sprints/ActiveSprintsList";
import { ActiveSprintsPanel } from "../../components/active-sprints/ActiveSprintsPanel";
import type { DeliverySnapshot } from "../../entities/delivery";

const SPRINT_LIMIT = 3;

export function ActiveSprints({
  sprints,
  sprintCount,
}: {
  sprints: DeliverySnapshot["sprints"];
  sprintCount: number;
}) {
  const visibleSprints = sprints.slice(0, SPRINT_LIMIT);

  return (
    <ActiveSprintsPanel>
      <ActiveSprintsHeader sprintCount={sprintCount} />
      <ActiveSprintsList sprints={visibleSprints} />
      {sprintCount > SPRINT_LIMIT && (
        <ActiveSprintsFooter visibleCount={visibleSprints.length} sprintCount={sprintCount} />
      )}
    </ActiveSprintsPanel>
  );
}
