import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";
import { PlanningFormHeader } from "./PlanningFormHeader";
import { PlanningNameField } from "./PlanningNameField";
import { PlanningDescriptionField } from "./PlanningDescriptionField";
import { PlanningStatusAndDateFields } from "./PlanningStatusAndDateFields";
import { PlanningLinkedWorkFields } from "./PlanningLinkedWorkFields";
import { PlanningFormActions } from "./PlanningFormActions";

export function PlanningFormDialog({ model }: { model: ReturnType<typeof usePlanningFormModel> }) {
  const { isLoading, error, submit } = model;
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="planning-form-title"
      className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-xl border border-line bg-surface p-6"
    >
      <PlanningFormHeader model={model} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={isLoading} className="space-y-4 disabled:opacity-60">
          <PlanningNameField model={model} />
          <PlanningDescriptionField model={model} />
          <PlanningStatusAndDateFields model={model} />
          <PlanningLinkedWorkFields model={model} />
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <PlanningFormActions model={model} />
      </form>
    </section>
  );
}
