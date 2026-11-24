import { Check, ClipboardCheck } from "lucide-react";
import type { useReleaseDetailsModel } from "../../features/release-details/useReleaseDetailsModel";

export function ReleaseApprovalHeader({
  model,
}: {
  model: ReturnType<typeof useReleaseDetailsModel>;
}) {
  const { result, approved, act, release, canManage } = model;
  return (
    <header className="release-panel-heading">
      <div>
        <h2 id="approval-flow-title">
          <ClipboardCheck size={20} /> Approval flow
        </h2>
        <p className="release-muted">
          {approved} of {release.steps.length} steps approved
        </p>
      </div>
      {canManage && release.state === "planned" && !!release.steps.length && (
        <button
          type="button"
          className="release-button primary"
          disabled={result.isLoading}
          onClick={() => void act({ action: "start" })}
        >
          Start review
        </button>
      )}
      {canManage && release.state === "ready" && (
        <button
          type="button"
          className="release-button primary"
          disabled={result.isLoading}
          onClick={() => void act({ action: "finish" })}
        >
          <Check size={16} /> Mark done
        </button>
      )}
    </header>
  );
}
