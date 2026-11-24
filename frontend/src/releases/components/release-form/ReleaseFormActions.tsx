import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
export function ReleaseFormActions({ model }: { model: ReturnType<typeof useReleaseFormModel> }) {
  const { saveState, release, onClose } = model;
  return (
    <footer className="release-actions justify-end">
      <button
        type="button"
        className="release-button"
        disabled={saveState.isLoading}
        onClick={onClose}
      >
        Cancel
      </button>
      <button type="submit" className="release-button primary" disabled={saveState.isLoading}>
        {saveState.isLoading ? "Saving…" : release ? "Save release" : "Create release"}
      </button>
    </footer>
  );
}
