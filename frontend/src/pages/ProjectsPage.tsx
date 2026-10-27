import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Project } from "../entities/project";
import { useProjectContext } from "../features/projects/context/useProjectContext";
import CreateProjectDialog from "../features/projects/components/CreateProjectDialog";
import { ProjectListSection } from "../sections/projects/ProjectListSection";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, loading, error, reload, select, setDefault } = useProjectContext();
  const [actionError, setActionError] = useState("");

  function open(id: number) {
    select(id);
    navigate(`/project/${id}`);
  }

  async function toggleDefault(project: Project) {
    setActionError("");
    try {
      await setDefault(project.is_default ? null : project.id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Unable to update default project.");
    }
  }
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const [showCreate, setShowCreate] = useState(false);
  const filtered = projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(search.trim().toLowerCase()));

  return <main className="min-h-screen min-w-0 bg-gray-100"><div className="mx-auto max-w-8xl p-2">
    <div className="mb-4 flex justify-end"><button type="button" onClick={() => setShowCreate(true)} disabled={loading || Boolean(error)} className="rounded-lg bg-cyan-500 px-4 py-1 text-white transition hover:bg-cyan-600 disabled:opacity-50">+ Create</button></div>
    {showCreate && <CreateProjectDialog onClose={() => setShowCreate(false)} onCreated={reload} />}
    {loading && <p role="status" className="text-gray-600">Loading projects...</p>}{error && <p role="alert" className="text-red-500">{error}</p>}{actionError && <p role="alert" className="mb-3 text-red-500">{actionError}</p>}
    {!loading && filtered.length === 0 && !error ? <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">{projects.length ? "No projects match your search." : "No projects found. Click “Create Project” to add your first one."}</div> : <ProjectListSection projects={filtered} onOpen={open} onToggleDefault={(project) => void toggleDefault(project)} />}
  </div></main>;
}
