import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../features/projects/hooks/useProjects";
import CreateProjectDialog from "../features/projects/components/CreateProjectDialog";
import UserMenu from "../features/profile/components/UserMenu";
import { ProjectListSection } from "../sections/projects/ProjectListSection";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, loading, error, reload } = useProjects();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const filtered = projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(search.trim().toLowerCase()));

  return <main className="min-h-screen min-w-0 bg-gray-100"><div className="mx-auto max-w-8xl p-2">
    <header className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <h1 className="text-xl font-semibold text-gray-700">Projects</h1>
      <label className="relative w-full sm:w-90"><span className="sr-only">Search projects</span><input type="search" placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" /><Search size={16} aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" /></label>
      <div className="flex items-center justify-end gap-3"><UserMenu /></div>
    </header>
    <hr className="my-2 border-gray-300" />
    <div className="mb-4 flex justify-end"><button type="button" onClick={() => setShowCreate(true)} disabled={loading || Boolean(error)} className="rounded-lg bg-cyan-500 px-4 py-1 text-white transition hover:bg-cyan-600 disabled:opacity-50">+ Create</button></div>
    {showCreate && <CreateProjectDialog onClose={() => setShowCreate(false)} onCreated={reload} />}
    {loading && <p role="status" className="text-gray-600">Loading projects...</p>}{error && <p role="alert" className="text-red-500">{error}</p>}
    {!loading && filtered.length === 0 && !error ? <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">{projects.length ? "No projects match your search." : "No projects found. Click “Create Project” to add your first one."}</div> : <ProjectListSection projects={filtered} onOpen={(id) => navigate(`/project/${id}`)} />}
  </div></main>;
}
