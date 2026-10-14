import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import CreateProject from "./components/CreateProject";

type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

function Dashboard({ title = "Dashboard" }: { title?: string }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  return (
    <main className="min-w-0 min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Workspace</p>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-600 transition"
          >
            Create Project
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

        {!loading && projects.length === 0 && !error ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-gray-600">
            No projects found. Click “Create Project” to add your first one.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/project/${project.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-cyan-600">
                    Project
                  </span>
                  <span className="text-xs text-gray-400">#{project.id}</span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.name}
                </h2>

                <p className="text-gray-600 line-clamp-3">
                  {project.description || "No description provided."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;