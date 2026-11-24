import { Network, Plus } from "lucide-react";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapFeaturesEmpty({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { tasks, setAllWork, canWrite, addFeature } = model;
  return (
    <section className="roadmap-empty">
      <Network size={36} />
      <h3>Build your path to delivery</h3>
      <p>
        Add features, assign start and delivery dates, and connect their dependencies. Existing
        epics, initiatives and enhancements appear here automatically.
      </p>
      {canWrite && (
        <button type="button" className="roadmap-button primary" onClick={() => addFeature()}>
          <Plus size={15} />
          Plan your first feature
        </button>
      )}
      {tasks.length > 0 && (
        <button type="button" className="roadmap-button" onClick={() => setAllWork(true)}>
          Show existing work items
        </button>
      )}
    </section>
  );
}
