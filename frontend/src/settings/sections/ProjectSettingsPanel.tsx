import { Link } from "react-router-dom";
import { useProjectContext } from "../../common/features/projects/context/useProjectContext";
import ProjectSettingsPage from "../../project-detail/ProjectSettingsPage";
import TeamPage from "../../team/TeamPage";

export default function ProjectSettingsPanel({ teams = false }: { teams?: boolean }) {
  const { projects, selectedId, select, loading, error } = useProjectContext();
  const projectId = selectedId ?? projects[0]?.id;
  return (
    <section className="settings-panel settings-project-panel">
      <div className="settings-project-heading">
        <div>
          <h3>{teams ? "Project teams" : "Project configuration"}</h3>
          <p>Choose a project to {teams ? "view and manage its team" : "manage its settings"}.</p>
        </div>
        <label>
          Project
          <select
            aria-label="Settings project"
            value={projectId ?? ""}
            disabled={loading || !projects.length}
            onChange={(event) => select(Number(event.target.value))}
          >
            {!projects.length && <option value="">No projects available</option>}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p role="status" className="picker-message">
          Loading projects…
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : projectId ? (
        teams ? (
          <TeamPage key={projectId} projectId={projectId} embedded />
        ) : (
          <ProjectSettingsPage key={projectId} projectId={projectId} embedded />
        )
      ) : (
        <div className="settings-empty">
          <p>Create or join a project to manage {teams ? "its team" : "project settings"}.</p>
          <Link to="/projects" className="settings-action mt-3">
            Browse projects →
          </Link>
        </div>
      )}
    </section>
  );
}
