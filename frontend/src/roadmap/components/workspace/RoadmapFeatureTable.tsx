import { CheckCircle2, Pencil } from "lucide-react";
import { shortDate, statusLabel, weekLabel } from "../../utils/roadmapModel";
import { featureColor } from "../../utils/timelineModel";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapFeatureTable({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { selectedId, setSelectedId, setEditing, canWrite, plan, filtered } = model;
  return (
    <table className="roadmap-feature-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Feature</th>
          <th>Status</th>
          <th>Story progress</th>
          <th>Planned start</th>
          <th>Expected delivery</th>
          <th>Delivery week</th>
          <th>Predecessors</th>
          <th>Slack</th>
          <th>Critical</th>
          <th>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {plan.nodes
          .filter((node) => filtered.some((task) => task.id === node.task.id))
          .map((node) => (
            <tr key={node.task.id} className={selectedId === node.task.id ? "selected" : ""}>
              <td>#{node.task.id}</td>
              <td>
                <button
                  type="button"
                  className="roadmap-table-name"
                  onClick={() => setSelectedId(node.task.id)}
                >
                  {node.task.title}
                </button>
              </td>
              <td>
                <span className={`roadmap-status ${node.task.status === "done" ? "complete" : ""}`}>
                  {statusLabel(node.task.status)}
                </span>
              </td>
              <td>
                <span
                  className="roadmap-table-progress"
                  title={`${node.task.story_progress?.completed ?? 0}/${node.task.story_progress?.total ?? 0} stories complete`}
                >
                  <i
                    style={{
                      background: featureColor(node.task),
                      width: `${node.task.story_progress?.percent ?? 0}%`,
                    }}
                  />
                  <b>{node.task.story_progress?.percent ?? 0}%</b>
                </span>
              </td>
              <td>{shortDate(node.task.planned_start_date)}</td>
              <td>{shortDate(node.task.due_date)}</td>
              <td>
                <span className="roadmap-week-chip">{weekLabel(node.task.due_date)}</span>
              </td>
              <td>{node.task.blocked_by.map((id) => `#${id}`).join(", ") || "—"}</td>
              <td>{plan.completeSchedule ? `${node.slack}d` : "—"}</td>
              <td>
                {node.critical ? (
                  <CheckCircle2
                    size={15}
                    className="roadmap-critical-mark"
                    aria-label="On critical path"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="roadmap-edit-button"
                  aria-label={`Edit ${node.task.title}`}
                  disabled={!canWrite}
                  onClick={() => setEditing(node.task)}
                >
                  <Pencil size={14} />
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
