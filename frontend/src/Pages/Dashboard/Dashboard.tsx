import { useEffect, useState } from "react";
import { ArrowRight, CircleCheck, Clock, FolderKanban, MessageCircle, Monitor, Smartphone, TrendingUp, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import type { Task } from "../ProjectDetail/components/TaskCard";

type DashboardStats = {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
};

const sampleProjects = [
  {
    name: "Website redesign",
    description: "Improve brand and user experience",
    progress: 78,
    due: "Due Apr 25, 2025",
    status: "On track",
    icon: Monitor,
    iconClass: "bg-blue-100 text-blue-600",
    barClass: "bg-blue-500",
    people: ["JD", "AM", "KL"],
    extraPeople: 2,
  },
  {
    name: "Mobile app launch",
    description: "v2.0 for iOS and Android",
    progress: 52,
    due: "Due Apr 18, 2025",
    status: "At risk",
    icon: Smartphone,
    iconClass: "bg-teal-100 text-teal-600",
    barClass: "bg-teal-500",
    people: ["MP", "SR", "TC"],
    extraPeople: 3,
  },
  {
    name: "Customer research",
    description: "Understand customer needs 2025",
    progress: 68,
    due: "Due May 2, 2025",
    status: "On track",
    icon: UsersRound,
    iconClass: "bg-violet-100 text-violet-600",
    barClass: "bg-indigo-500",
    people: ["KL", "JD"],
    extraPeople: 1,
  },
];

const sampleActivity = [
  { initials: "DP", name: "Daniel Park", action: "updated the project timeline for", project: "Mobile app launch.", time: "2 hours ago", color: "bg-sky-100 text-sky-700" },
  { initials: "PS", name: "Priya Shah", action: "completed a task in", project: "Website redesign.", time: "4 hours ago", color: "bg-rose-100 text-rose-700" },
  { initials: "JL", name: "James Lee", action: "commented on", project: "Customer research.", note: "“These insights look great — let’s include them in the next update.”", time: "6 hours ago", color: "bg-amber-100 text-amber-700" },
  { initials: "SK", name: "Sara Kim", action: "added a new task to", project: "Mobile app launch.", time: "1 day ago", color: "bg-violet-100 text-violet-700" },
];

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

        <div className="mt-7 grid gap-5 xl:grid-cols-2">
          <section aria-labelledby="my-projects-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="my-projects-title" className="text-lg font-semibold tracking-tight text-slate-900">My projects</h2>
              <button type="button" onClick={() => navigate("/projects")} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                View all projects <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              {sampleProjects.map((project) => {
                const Icon = project.icon;
                return (
                  <article key={project.name} className="rounded-xl border border-slate-100 p-3 sm:p-4">
                    <div className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${project.iconClass}`}><Icon size={20} aria-hidden="true" /></span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-800">{project.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{project.description}</p>
                      </div>
                      <span className={`col-start-2 mt-1 w-fit rounded-full px-2.5 py-1 text-xs font-medium sm:col-start-auto sm:mt-0 ${project.status === "At risk" ? "bg-orange-50 text-orange-700" : "bg-teal-50 text-teal-700"}`}>{project.status}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:ml-[56px]">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${project.name} progress`} aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className={`h-full rounded-full ${project.barClass}`} style={{ width: `${project.progress}%` }} />
                      </div>
                      <div className="flex -space-x-2" aria-label={`Team: ${project.people.join(", ")}`}>
                        {project.people.map((person) => <span key={person} aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-slate-600">{person}</span>)}
                        {project.extraPeople > 0 && <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-medium text-slate-500">+{project.extraPeople}</span>}
                      </div>
                      <span className="text-xs font-medium text-slate-500">{project.progress}%</span>
                      <span className="text-right text-xs text-slate-500">{project.due}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="recent-activity-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="recent-activity-title" className="text-lg font-semibold tracking-tight text-slate-900">Recent activity</h2>
              <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                View all activity <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <ul className="divide-y divide-slate-100">
              {sampleActivity.map((activity) => (
                <li key={activity.name} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
                  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activity.color}`}>{activity.initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-slate-600"><span className="font-semibold text-slate-800">{activity.name}</span> {activity.action} <span className="font-semibold text-slate-800">{activity.project}</span></p>
                    {activity.note && <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-slate-500"><MessageCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />{activity.note}</p>}
                  </div>
                  <time className="shrink-0 pt-0.5 text-right text-xs text-slate-400">{activity.time}</time>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
