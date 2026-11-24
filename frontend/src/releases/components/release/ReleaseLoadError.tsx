import type { useReleasePageModel } from "../../features/release/useReleasePageModel";

export function ReleaseLoadError({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { query } = model;
  return (
    <p role="alert" className="release-error">
      Could not load releases.{" "}
      <button type="button" className="release-link" onClick={() => void query.refetch()}>
        Try again
      </button>
    </p>
  );
}
