import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import CreateProject from "../Dashboard/components/CreateProject";
import { LockKeyhole, Search } from "lucide-react";
import ProjectCard, {type Project} from "./components/ProjectCard";



type LoggedInUser = {
  id: number;
  email: string;
};

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const [user] = useState<LoggedInUser | null>(() => {
  const storedUser = sessionStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(storedUser);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      typeof parsed.id === "number" &&
      "email" in parsed &&
      typeof parsed.email === "string" &&
      parsed.email.trim().length > 0
    ) {
      return { id: parsed.id, email: parsed.email.trim() };
    }

    console.error("Stored user data has an invalid format.");
    return null;
  } catch (error) {
    console.error("Unable to read the logged-in user:", error);
    return null;
  }
});

  const fetchProjects = useCallback(async () => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const data = await apiFetch<Project[]>("/projects/");
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const loadProjects = async () => {
      await fetchProjects();
    };

    void loadProjects();
  }, [fetchProjects]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description}`
     .toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <main className="min-w-0 min-h-screen bg-gray-100  ">
      <div className="max-w-8xl mx-auto p-2">
        <header className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <h1 className="text-xl font-semibold text-gray-700">Projects</h1>

          <label className="relative w-full sm:w-90">
            <span className="sr-only">Search projects</span>
            
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <Search
              size={16}
              aria-hidden="true"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            {user && (
              <span
                role="img"
                aria-label={`Logged in as ${user.email}`}
                title={user.email}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700"
              >
                {user.email.charAt(0).toUpperCase()}
              </span>
            )}

            <button
              type="button"
              title="Logout"
              aria-label="Logout"
              onClick={handleLogout}
              className="rounded p-1 text-gray-600 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <LockKeyhole aria-hidden="true" size={20} />
            </button>
          </div>
        </header>
        <hr className="my-2 border-gray-300" />

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-cyan-500 text-white px-4 py-1 rounded-lg hover:bg-cyan-600 transition"
          >
            + Create 
          </button>
        </div>
        {showCreateForm && (
          <CreateProject
            onClose={() => setShowCreateForm(false)}
            onCreated={fetchProjects}
          />
        )}
       

        {loading && <p className="text-gray-600">Loading projects...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && filteredProjects.length === 0 && !error ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
              {projects.length === 0
                ? "No projects found. Click “Create Project” to add your first one."
                : "No projects match your search."}
            </div>
          ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/project/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Projects;