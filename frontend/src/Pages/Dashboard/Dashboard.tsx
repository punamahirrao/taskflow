import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const fetchProjects = async () => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/projects/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [navigate]);

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
      const response = await fetch("http://localhost:8000/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.name?.[0] || data?.detail || "Unable to create project.");
      }

      setProjectName("");
      setProjectDescription("");
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleCreateProject} className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create Project</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />

          <input
            type="text"
            placeholder="Project description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 bg-cyan-500 text-white px-4 py-2 rounded"
        >
          {submitting ? "Creating..." : "Create Project"}
        </button>
      </form>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {projects.length === 0 && !loading && !error ? (
        <p className="text-gray-600">No projects found. Create your first project above.</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-gray-600">{project.description || "No description provided."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;