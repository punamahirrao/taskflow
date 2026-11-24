import { PlanningFormView } from "../../components/planning-form/PlanningFormView";
import type { PlanningRecord } from "../../entities/planning";
import { usePlanningFormModel } from "./usePlanningFormModel";
export function PlanningForm({
  kind,
  item,
  onClose,
}: {
  kind: PlanningRecord["kind"];
  item?: PlanningRecord;
  onClose: () => void;
}) {
  const model = usePlanningFormModel({ kind, item, onClose });
  return <PlanningFormView model={model} />;
}
