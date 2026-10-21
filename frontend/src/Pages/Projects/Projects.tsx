import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import CreateProject from "../Dashboard/components/CreateProject";
import { LockKeyhole } from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

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

  return (
    <main className="min-w-0 min-h-screen bg-gray-100  ">
      <div className="max-w-8xl mx-auto p-2">
        <div className="flex justify-between items-center ">
          <div>
            {/* <p className="text-sm text-gray-500 uppercase tracking-wide">Workspace</p> */}
            <h1 className="text-xl font-semibold text-gray-700">Projects</h1>
          </div>

          <div className="flex items-center gap-3">
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
        </div>
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

        {!loading && projects.length === 0 && !error ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-gray-600">
            No projects found. Click “Create Project” to add your first one.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

export default Projects;