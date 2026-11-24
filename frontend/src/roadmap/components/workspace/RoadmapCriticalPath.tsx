import { Flag } from "lucide-react";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapCriticalPath({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { setSelectedId, plan } = model;
  return (
    <section className="roadmap-critical-list">
      <h4>
        <Flag size={14} />
        Critical path
      </h4>
      {plan.completeSchedule ? (
        plan.nodes
          .filter((node) => node.critical)
          .map((node) => (
            <button key={node.task.id} type="button" onClick={() => setSelectedId(node.task.id)}>
              <span>#{node.task.id}</span>
              {node.task.title}
            </button>
          ))
      ) : (
        <p>
          Add start and delivery dates to every visible feature and include all predecessors to
          calculate the critical path.
        </p>
      )}
      <small>
        CPM uses calendar-day durations and finish-to-start dependencies. Delivery weeks use ISO
        weeks.
      </small>
    </section>
  );
}
