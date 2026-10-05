import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

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

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await apiFetch("/projects/", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });
      setProjectDescription("");
      setShowCreateForm(false);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Workspace</p>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-600 transition"
          >
            {showCreateForm ? "Close Form" : "Create Project"}
          </button>
        </div>

        {showCreateForm && (
          <div className="flex justify-center  ">
            <form
              onSubmit={handleCreateProject}
              className="flex flex-col bg-white p-6 rounded-2xl w-1/2 shadow-sm border border-gray-200 mb-8"
            >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Create new project
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project name
                </label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Enter project description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
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
    </div>
  );
}

export default Dashboard;