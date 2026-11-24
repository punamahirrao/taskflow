import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";

export function PlanningFormActions({ model }: { model: ReturnType<typeof usePlanningFormModel> }) {
  const { values, isLoading, kind, item, onClose } = model;
  return (
    <footer className="flex justify-end gap-3">
      <button type="button" disabled={isLoading} onClick={onClose}>
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading || !values.name.trim()}
        className="rounded bg-accent px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoading ? "Saving…" : item ? "Save changes" : `Create ${kind}`}
      </button>
    </footer>
  );
}
