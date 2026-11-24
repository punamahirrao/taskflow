import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";
import { PlanningFormDialog } from "./PlanningFormDialog";

export function PlanningFormView({ model }: { model: ReturnType<typeof usePlanningFormModel> }) {
  const { isLoading, onClose } = model;
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <PlanningFormDialog model={model} />
    </div>
  );
}
