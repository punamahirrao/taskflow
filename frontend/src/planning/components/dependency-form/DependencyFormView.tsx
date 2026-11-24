import type { useDependencyFormModel } from "../../features/dependency-form/useDependencyFormModel";
import { DependencyFormDialog } from "./DependencyFormDialog";

export function DependencyFormView({
  model,
}: {
  model: ReturnType<typeof useDependencyFormModel>;
}) {
  const { isLoading, onClose } = model;
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <DependencyFormDialog model={model} />
    </div>
  );
}
