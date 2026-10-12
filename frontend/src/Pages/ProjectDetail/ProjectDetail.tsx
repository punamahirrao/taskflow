import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import TaskCard, { type Task } from "./components/TaskCard";
import AddTask from "./components/AddTask";
import ProjectSidebar from "./components/ProjectSidebar";


type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

const columns: { status: Task["status"]; title: string; headerClass: string }[] = [
  { status: "todo", title: "Todo", headerClass: "bg-purple-100" },
  { status: "in_progress", title: "In Progress", headerClass: "bg-green-100" },
  { status: "done", title: "Done", headerClass: "bg-orange-100" },
];

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);  
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectList = await apiFetch<Project[]>("/projects/");
        setProjects(projectList);
        const selectedProject = projectList.find((item) => item.id === Number(id));

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

  const handleCreateProject = async (name: string, description: string) => {
  const newProject = await apiFetch<Project>("/projects/", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

  setProjects((currentProjects) => [...currentProjects, newProject]);
  navigate(`/project/${newProject.id}`);
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
    <div className="min-h-screen bg-gray-100">
  <div className="min-h-screen md:grid md:grid-cols-[250px_minmax(0,1fr)]">
    <ProjectSidebar
      projects={projects}
      activeProjectId={Number(id)}
      onSelectProject={(projectId) => navigate(`/project/${projectId}`)}
      onCreateProject={handleCreateProject}
    />

    <main className="min-w-0 p-4 md:p-8">
      {/* Move the existing project header and task columns here */}
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

        <div className="mt-6 ">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center  mb-5">
              <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
              <span className="text-sm text-red-500 ml-2">{tasks.length} </span>
              <button 
              type="button"
              onClick={() => setShowAddTask((isOpen) => !isOpen)}
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 ml-auto">
                {showAddTask ? "Close" : "+ Add"}
              </button>
            </div>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            {showAddTask && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close add task dialog"
                  onClick={() => setShowAddTask(false)}
                  className="absolute inset-0 cursor-default bg-black/50"
                />
                <div className="relative z-10 w-full max-w-lg">
                <AddTask
                  project={project}
                  onClose={() => setShowAddTask(false)}
                  onTaskAdded={(newTask) => {
                    setTasks((currentTasks) => [...currentTasks, newTask]);
                    setShowAddTask(false);
                  }}
                />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              {columns.map((column) => (
                <div key={column.status} className="border border-gray-200 bg-gray-50 rounded-lg">
                  <h3 className={`text-lg font-semibold text-gray-600 text-center rounded-t-lg mb-2 ${column.headerClass}`}>
                    {column.title}
                  </h3>
                  <div className="flex flex-col gap-2 p-2">
                    {tasks
                      .filter((task) => task.status === column.status)
                      .map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  </div>
</div>
    
  );
}

export default ProjectDetail;



