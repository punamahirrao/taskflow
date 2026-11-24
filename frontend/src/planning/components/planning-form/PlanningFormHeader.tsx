import { X } from "lucide-react";
import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";

export function PlanningFormHeader({ model }: { model: ReturnType<typeof usePlanningFormModel> }) {
  const { isLoading, kind, item, onClose } = model;
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <h2 id="planning-form-title" className="text-xl font-semibold">
        {item ? "Edit" : "Create"} {kind}
      </h2>
      <button
        type="button"
        aria-label={`Close ${kind} form`}
        disabled={isLoading}
        onClick={onClose}
        className="rounded p-1 text-muted hover:bg-subtle"
      >
        <X size={20} />
      </button>
    </header>
  );
}
