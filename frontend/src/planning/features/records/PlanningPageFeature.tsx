import { PlanningPageView } from "../../components/records/PlanningPageView";
import type { PlanningRecord } from "../../entities/planning";
import { usePlanningPageModel } from "./usePlanningPageModel";
export function PlanningPageFeature({ kind }: { kind: PlanningRecord["kind"] }) {
  const model = usePlanningPageModel({ kind });
  return <PlanningPageView model={model} />;
}
