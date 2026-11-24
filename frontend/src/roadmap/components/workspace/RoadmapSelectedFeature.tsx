import { Pencil, X } from "lucide-react";
import { shortDate, statusLabel, weekLabel } from "../../utils/roadmapModel";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapSelectedFeature({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { tasks, setTab, setSelectedId, setEditing, canWrite, selected } = model;
  if (!selected) return null;
  return (
    <section className="roadmap-selected-feature">
      <header>
        <h4>Feature details</h4>
        <button
          type="button"
          aria-label="Close feature details"
          onClick={() => setSelectedId(null)}
        >
          <X size={14} />
        </button>
      </header>
      <span className="roadmap-feature-id">#{selected.task.id}</span>
      <b>{selected.task.title}</b>
      <span className="roadmap-week-chip">{weekLabel(selected.task.due_date)}</span>
      <p>
        {shortDate(selected.task.planned_start_date)} → {shortDate(selected.task.due_date)}
      </p>
      <p>{statusLabel(selected.task.status)}</p>
      {selected.task.description && <p>{selected.task.description}</p>}
      <h5>User story progress</h5>
      <p>
        {selected.task.story_progress?.completed ?? 0}/{selected.task.story_progress?.total ?? 0}{" "}
        complete · {selected.task.story_progress?.percent ?? 0}%
      </p>
      <button type="button" className="roadmap-button" onClick={() => setTab("stories")}>
        View user stories
      </button>
      <h5>Depends on</h5>
      {selected.task.blocked_by.length ? (
        selected.task.blocked_by.map((id) => (
          <p key={id}>
            {tasks.find((task) => task.id === id)?.title ??
              `Work item #${id} (outside this project)`}
          </p>
        ))
      ) : (
        <p>No predecessors</p>
      )}
      <button
        type="button"
        className="roadmap-button"
        disabled={!canWrite}
        onClick={() => setEditing(selected.task)}
      >
        <Pencil size={13} />
        Edit feature
      </button>
    </section>
  );
}
