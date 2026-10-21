import { useEffect, useState } from "react";
import { CircleCheck, Clock, FolderKanban, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import type { Task } from "../ProjectDetail/components/TaskCard";

type DashboardStats = {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const projects = await apiFetch<{ id: number }[]>("/projects/");
        const projectTasks = await Promise.all(
          projects.map((project) =>
            apiFetch<Task[]>(`/tasks/?project_id=${project.id}`),
          ),
        );
        const tasks = projectTasks.flat();
        const completedTasks = tasks.filter((task) => task.status === "done").length;

        if (!cancelled) {
          setStats({
            totalProjects: projects.length,
            completedTasks,
            pendingTasks: tasks.length - completedTasks,
            completionRate: tasks.length === 0
              ? 0
              : Math.round((completedTasks / tasks.length) * 100),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const cards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects,
      detail: "Projects in your workspace",
      icon: FolderKanban,
      iconClass: "bg-indigo-600",
      detailClass: "text-indigo-600",
    },
    {
      title: "Tasks Completed",
      value: stats?.completedTasks,
      detail: "Tasks marked as done",
      icon: CircleCheck,
      iconClass: "bg-emerald-500",
      detailClass: "text-emerald-600",
    },
    {
      title: "Pending Tasks",
      value: stats?.pendingTasks,
      detail: "To do and in progress",
      icon: Clock,
      iconClass: "bg-amber-500",
      detailClass: "text-amber-600",
    },
    {
      title: "Task Completion Rate",
      value: stats ? `${stats.completionRate}%` : undefined,
      detail: "Completed / total tasks",
      icon: TrendingUp,
      iconClass: "bg-purple-600",
      detailClass: "text-purple-600",
    },
  ];

  return (
    <main className="min-h-screen min-w-0 bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Here's what's happening with your projects today.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Logout
          </button>
        </header>

        {error && (
          <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setStats(null);
                setLoading(true);
                setLoadAttempt((attempt) => attempt + 1);
              }}
              className="rounded-md px-3 py-1 font-semibold hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Try again
            </button>
          </div>
        )}

        <section aria-label="Workspace summary" aria-busy={loading}>
          {loading && <p role="status" className="sr-only">Loading dashboard statistics...</p>}
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ title, value, detail, icon: Icon, iconClass, detailClass }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <dt className="text-sm text-slate-500">{title}</dt>
                    <dd className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                      {loading ? (
                        <span aria-hidden="true" className="block h-9 w-16 animate-pulse rounded bg-slate-100" />
                      ) : value ?? "Unavailable"}
                    </dd>
                  </div>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${iconClass}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                </div>
                <p className={`mt-3 text-xs font-medium ${detailClass}`}>{detail}</p>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
