import type { useDependencyFormModel } from "../../features/dependency-form/useDependencyFormModel";
import { DependencyFormHeader } from "./DependencyFormHeader";
import { DependencyFields } from "./DependencyFields";
import { DependencyFormActions } from "./DependencyFormActions";

export function DependencyFormDialog({
  model,
}: {
  model: ReturnType<typeof useDependencyFormModel>;
}) {
  const { error, submit } = model;
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="dependency-form-title"
      className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-xl border border-line bg-surface p-6 text-content shadow-xl"
    >
      <DependencyFormHeader model={model} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <DependencyFields model={model} />
        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}
        <DependencyFormActions model={model} />
      </form>
    </section>
  );
}
