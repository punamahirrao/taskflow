import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils/api";

type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  project: number;
};

type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

const statusLabels: Record<Task["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projects = await apiFetch<Project[]>("/projects/");
        const selectedProject = projects.find((item) => item.id === Number(id));

        if (!selectedProject) {
          setError("Project not found.");
          return;
        }

        setProject(selectedProject);
        const projectTasks = await apiFetch<Task[]>(`/tasks/?project_id=${id}`);
        setTasks(projectTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load project.");
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [id]);

  const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || !title.trim()) {
      setError("Task title is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const task = await apiFetch<Task>("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          project_id: project.id,
          title: title.trim(),
          description: description.trim(),
          status,
        }),
      });
      setTasks((currentTasks) => [task, ...currentTasks]);
      setTitle("");
      setDescription("");
      setStatus("todo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-600">{error || "Project not found."}</p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 text-cyan-700 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-cyan-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Project #{id}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{project.name}</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                {project.description}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                Edit
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
              <span className="text-sm text-gray-500">{tasks.length} tasks</span>
            </div>

            {error && <p className="mb-4 text-red-600">{error}</p>}
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {task.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === "done"
                          ? "bg-green-100 text-green-700"
                          : task.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[task.status]}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-2">{task.description}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add Task
            </h2>

            <form className="space-y-4" onSubmit={handleAddTask}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter task title"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the task"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Task["status"])}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-500 text-white px-4 py-2.5 rounded-lg hover:bg-cyan-600 disabled:opacity-50"
              >
                {submitting ? "Adding task..." : "Add Task"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;