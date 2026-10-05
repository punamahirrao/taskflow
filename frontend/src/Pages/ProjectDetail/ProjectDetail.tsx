import { useNavigate, useParams } from "react-router-dom";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
};

const mockProject: Project = {
  id: 1,
  name: "Website Redesign",
  description:
    "Improve the homepage layout, update the dashboard cards, and improve the visual hierarchy for better usability.",
};

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Create homepage wireframe",
    description: "Draft the structure for the landing page and hero section.",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Update dashboard cards",
    description: "Improve spacing, color contrast, and typography.",
    status: "Todo",
  },
  {
    id: 3,
    title: "Review user flow",
    description: "Check login, dashboard, and project details flow end-to-end.",
    status: "Done",
  },
];

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

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
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                {mockProject.name}
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                {mockProject.description}
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
              <span className="text-sm text-gray-500">
                {mockTasks.length} tasks
              </span>
            </div>

            <div className="space-y-4">
              {mockTasks.map((task) => (
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
                        task.status === "Done"
                          ? "bg-green-100 text-green-700"
                          : task.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {task.status}
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

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
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
                  placeholder="Describe the task"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 text-white px-4 py-2.5 rounded-lg hover:bg-cyan-600"
              >
                Add Task
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;