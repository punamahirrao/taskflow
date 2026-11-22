import { PaddedPage } from "./styled";
import {
  ArrowUpRight,
  Flag,
  FolderKanban,
  GitBranch,
  Milestone,
  Target,
  LayoutTemplate,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProjectContext } from "../features/projects/context/useProjectContext";
import { settingsCategories, settingSlug } from "../../settings/config/settingsCatalog";

const pages = {
  "/releases": {
    title: "Releases",
    description: "Bring delivery milestones and release plans together.",
    icon: Flag,
    settings: "/settings/work-management/release-rules",
  },
  "/goals": {
    title: "Goals",
    description: "Connect your team’s work to meaningful outcomes.",
    icon: Target,
    settings: "/settings/reports",
  },
  "/planning/project-plans": {
    title: "Project Plans",
    description: "Open a project to review its work, schedule and delivery plan.",
    icon: FolderKanban,
    settings: "/settings/project-planning",
  },
  "/planning/charts": {
    title: "Charts",
    description: "Explore delivery metrics and project progress.",
    icon: BarChart3,
    settings: "/settings/reports",
  },
  "/planning/milestones": {
    title: "Milestones",
    description: "Track the important checkpoints in your project plans.",
    icon: Milestone,
    settings: "/settings/project-planning/milestone-types",
  },
  "/planning/dependencies": {
    title: "Dependencies",
    description: "Identify relationships between work and keep delivery moving.",
    icon: GitBranch,
    settings: "/settings/project-planning/dependency-types",
  },
  "/templates": {
    title: "Templates",
    description: "Explore reusable starting points for your team’s work.",
    icon: LayoutTemplate,
    settings: "/settings/templates",
  },
};
export default function OrganizationSectionPage() {
  const { pathname } = useLocation();
  const page = pages[pathname as keyof typeof pages];
  const { projects, selectedId, loading, error } = useProjectContext();
  if (!page)
    return (
      <main className="p-8">
        <h1>Page not found</h1>
        <Link to="/dashboard">Return to dashboard</Link>
      </main>
    );
  const Icon = page.icon;
  const isPlans = pathname === "/planning/project-plans";
  return (
    <PaddedPage>
      <div className="mx-auto max-w-6xl">
        <p className="settings-eyebrow">
          {pathname.startsWith("/planning") ? "PLANNING" : "ORGANIZATION"}
        </p>
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
            <p className="mt-3 text-sm text-muted">{page.description}</p>
          </div>
          <Link
            to={page.settings}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-xs"
          >
            Configure
            <ArrowUpRight size={14} />
          </Link>
        </header>
        {pathname === "/templates" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {settingsCategories
              .find((category) => category.id === "templates")!
              .items.map((item) => (
                <Link
                  key={item}
                  to={`/settings/templates/${settingSlug(item)}`}
                  className="rounded-xl border border-line bg-surface p-6 hover:border-accent"
                >
                  <LayoutTemplate size={25} className="mb-4 text-accent" />
                  <h2 className="text-sm font-semibold">{item}</h2>
                  <p className="mt-2 text-xs text-muted">
                    Explore configuration and availability →
                  </p>
                </Link>
              ))}
          </div>
        ) : isPlans ? (
          <>
            {error && (
              <p role="alert" className="text-danger">
                {error}
              </p>
            )}
            {loading && <p role="status">Loading projects…</p>}
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="rounded-xl border border-line bg-surface p-6 hover:border-accent"
                >
                  <FolderKanban size={22} className="mb-4 text-accent" />
                  <h2 className="text-sm font-semibold">{project.name}</h2>
                  <p className="mt-2 text-xs text-muted">
                    {project.description || "Open this project to explore its plan."}
                  </p>
                  <p className="mt-5 flex items-center gap-2 text-xs text-muted">
                    <CalendarDays size={14} />
                    {project.expected_start_date ?? "Start not scheduled"} →{" "}
                    {project.end_date ?? "End not scheduled"}
                  </p>
                </Link>
              ))}
            </div>
            {!loading && !projects.length && !error && (
              <p className="rounded-xl border border-line bg-surface p-8 text-sm text-muted">
                Create or join a project to see it here.
              </p>
            )}
          </>
        ) : (
          <section className="rounded-2xl border border-line bg-surface p-10 text-center">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-subtle text-accent">
              <Icon size={30} />
            </span>
            <h2 className="text-lg font-semibold">
              {pathname === "/planning/charts"
                ? "Explore your delivery insights"
                : `${page.title} organization`}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              {pathname === "/planning/charts"
                ? "Open Reports to see charts and metrics for your projects."
                : pathname === "/planning/dependencies"
                  ? "Manage blocked-by relationships on work items in your project. A organization dependency view is not available yet."
                  : `This area is ready for future ${page.title.toLowerCase()} features. Dedicated management tools are not available yet.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white"
                to={
                  pathname === "/planning/charts"
                    ? "/reports"
                    : selectedId
                      ? `/project/${selectedId}`
                      : "/projects"
                }
              >
                {pathname === "/planning/charts" ? "Open reports" : "Explore project work"}
                <ArrowUpRight size={13} className="ml-2 inline" />
              </Link>
              <Link to={page.settings} className="rounded-lg border border-line px-4 py-2 text-xs">
                View settings
              </Link>
            </div>
          </section>
        )}
      </div>
    </PaddedPage>
  );
}
