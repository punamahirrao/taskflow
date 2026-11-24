import { Map as MapIcon } from "lucide-react";

import type { useRoadmapPageModel } from "../../features/overview/useRoadmapPageModel";
export function RoadmapHeader({ model }: { model: ReturnType<typeof useRoadmapPageModel> }) {
  const { projects, select, loading, project } = model;
  return (
    <header className="roadmap-page-header">
      <div className="roadmap-title-group">
        <span className="roadmap-page-icon">
          <MapIcon size={23} />
        </span>
        <div>
          <div className="roadmap-title-line">
            <h1>RoadMap</h1>
            <span className="roadmap-live-badge">Feature planning</span>
          </div>
          <p>Connect your features. Plan the weeks. See the path to delivery.</p>
        </div>
      </div>
      <label className="roadmap-project-picker">
        <span>Project</span>
        <select
          aria-label="Roadmap project"
          value={project?.id ?? ""}
          disabled={loading || !projects.length}
          onChange={(event) => select(Number(event.target.value))}
        >
          {!projects.length && <option value="">No projects available</option>}
          {projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
