import { ChevronRight, Map as MapIcon } from "lucide-react";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import RoadmapWorkspace from "./RoadmapWorkspace";
import { RoadmapStyles } from "./Roadmap.styles";

export default function RoadmapPage() {
  const { projects, selectedId, select, loading, error } = useProjectContext();
  const project = projects.find((item) => item.id === selectedId);
  return (
    <main className="roadmap-page" data-testid="page-roadmap">
      <RoadmapStyles />
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
      <div className="roadmap-page-breadcrumb">
        <span>Planning</span>
        <ChevronRight size={12} />
        <b>RoadMap</b>
      </div>
      {error && (
        <p className="roadmap-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="roadmap-empty" role="status">
          Loading your projects…
        </p>
      ) : project ? (
        <RoadmapWorkspace key={project.id} project={project} />
      ) : (
        !error && (
          <section className="roadmap-empty">
            <MapIcon size={32} />
            <h2>Select a project to view its roadmap</h2>
            <p>Choose a project from the selector to plan its features and delivery weeks.</p>
          </section>
        )
      )}
    </main>
  );
}
