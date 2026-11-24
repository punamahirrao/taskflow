import type { useReleasePageModel } from "../../features/release/useReleasePageModel";
import { formatDate, releaseLabels } from "../../utils/releaseDisplay";
import { ReleaseFilters } from "./ReleaseFilters";

export function ReleaseList({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { setParams, items, visible, selected } = model;
  return (
    <section className="release-panel" aria-labelledby="release-list-title">
      <header className="release-panel-heading">
        <h2 id="release-list-title">Release list</h2>
      </header>
      <ReleaseFilters model={model} />
      {visible.length ? (
        <ul className="release-list">
          {visible.map((release) => (
            <li key={release.id}>
              <button
                type="button"
                aria-pressed={release.id === selected?.id}
                onClick={() => setParams({ release: String(release.id) })}
              >
                <strong>{release.name}</strong>
                <span>
                  <small>{formatDate(release.target_date)}</small>
                  <span className={`release-badge ${release.state}`}>
                    {releaseLabels[release.state]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="release-detail-body release-muted">
          {items.length
            ? "No releases match the current filters."
            : "Create a release to start planning delivery."}
        </p>
      )}
    </section>
  );
}
