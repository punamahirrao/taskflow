import type { PlanningRecord } from "./entities/planning";
import { PlanningPageFeature } from "./features/records/PlanningPageFeature";
export default function PlanningPage({ kind }: { kind: PlanningRecord["kind"] }) {
  return <PlanningPageFeature {...{ kind }} />;
}
