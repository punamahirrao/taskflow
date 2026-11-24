import type { useDependencyFormModel } from "../../features/dependency-form/useDependencyFormModel";

export function DependencyFormActions({
  model,
}: {
  model: ReturnType<typeof useDependencyFormModel>;
}) {
  const { selectedIds, isLoading, task, onClose } = model;
  return (
    <footer className="mt-5 flex justify-end gap-3">
      <button
        type="button"
        disabled={isLoading}
        onClick={onClose}
        className="rounded-lg border border-line px-4 py-2 text-sm"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading || !task || !selectedIds.length}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? "Creating…" : "Create dependency"}
      </button>
    </footer>
  );
}
