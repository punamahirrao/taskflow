import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapWorkspaceError({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { error, reload } = model;
  return (
    <p role="alert" className="roadmap-error">
      {error}
      <button type="button" onClick={() => void reload()}>
        Retry
      </button>
    </p>
  );
}
