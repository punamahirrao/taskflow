import { Download, Search } from "lucide-react";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapToolbar({ model }: { model: ReturnType<typeof useRoadmapWorkspaceModel> }) {
  const { query, setQuery, allWork, setAllWork, showCritical, setShowCritical, plan, exportCsv } =
    model;
  return (
    <div className="roadmap-toolbar">
      <label className="roadmap-filter">
        <Search size={15} />
        <input
          aria-label="Search roadmap features"
          type="search"
          placeholder="Search features or delivery week…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <label className="roadmap-checkbox">
        <input
          type="checkbox"
          checked={showCritical}
          onChange={(event) => setShowCritical(event.target.checked)}
        />
        <i />
        Show critical path
      </label>
      <label className="roadmap-checkbox">
        <input
          type="checkbox"
          checked={allWork}
          onChange={(event) => setAllWork(event.target.checked)}
        />
        Include all work items
      </label>
      <button
        type="button"
        className="roadmap-button"
        disabled={!plan.nodes.length}
        onClick={exportCsv}
      >
        <Download size={14} />
        Export CSV
      </button>
    </div>
  );
}
