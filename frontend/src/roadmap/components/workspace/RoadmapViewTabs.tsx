import { CalendarDays, Layers, Network } from "lucide-react";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapViewTabs({ model }: { model: ReturnType<typeof useRoadmapWorkspaceModel> }) {
  const { view, setView, showInsights, setShowInsights } = model;
  return (
    <div className="roadmap-view-tabs" aria-label="Roadmap views">
      <button type="button" aria-pressed={view === "network"} onClick={() => setView("network")}>
        <Network size={15} />
        Dependency map <span>CPM</span>
      </button>
      <button type="button" aria-pressed={view === "timeline"} onClick={() => setView("timeline")}>
        <CalendarDays size={15} />
        Timeline
      </button>
      <button
        type="button"
        className="roadmap-insights-toggle"
        aria-expanded={showInsights}
        onClick={() => setShowInsights(!showInsights)}
      >
        <Layers size={14} />
        Insights
      </button>
    </div>
  );
}
