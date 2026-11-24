import type { useReleaseDetailsModel } from "../../features/release-details/useReleaseDetailsModel";
import { releaseLabels } from "../../utils/releaseDisplay";

export function ReleaseOverviewHeader({
  model,
}: {
  model: ReturnType<typeof useReleaseDetailsModel>;
}) {
  const { canEdit, release, onEdit } = model;
  return (
    <header className="release-panel-heading">
      <div>
        <span className={`release-badge ${release.state}`}>{releaseLabels[release.state]}</span>
        <h2 id="release-title" className="mt-2">
          {release.name}
        </h2>
      </div>
      {canEdit && (
        <button className="release-button" type="button" onClick={onEdit}>
          Edit release
        </button>
      )}
    </header>
  );
}
