import { X } from "lucide-react";
import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
export function ReleaseFormHeader({ model }: { model: ReturnType<typeof useReleaseFormModel> }) {
  const { saveState, release, onClose } = model;
  return (
    <header className="release-panel-heading">
      <h2 id="release-form-title">{release ? "Edit release" : "Create release"}</h2>
      <button
        type="button"
        className="release-icon"
        aria-label="Close release editor"
        disabled={saveState.isLoading}
        onClick={onClose}
      >
        <X size={19} />
      </button>
    </header>
  );
}
