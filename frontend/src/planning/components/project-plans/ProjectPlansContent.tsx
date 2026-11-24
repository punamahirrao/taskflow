import type { useOrganizationSectionPageModel } from "../../features/project-plans/useOrganizationSectionPageModel";
import { ProjectPlansHeader } from "./ProjectPlansHeader";
import { PlanningTemplateList } from "./PlanningTemplateList";
import { ProjectPlanCards } from "./ProjectPlanCards";
import { PlanningSectionActions } from "./PlanningSectionActions";

export function ProjectPlansContent({
  model,
}: {
  model: ReturnType<typeof useOrganizationSectionPageModel>;
}) {
  const { pathname, page, projects, loading, error, Icon, isPlans } = model;
  return (
    <div className="mx-auto max-w-6xl">
      <p className="settings-eyebrow">
        {pathname.startsWith("/planning") ? "PLANNING" : "ORGANIZATION"}
      </p>
      <ProjectPlansHeader model={model} />
      {pathname === "/templates" ? (
        <PlanningTemplateList />
      ) : isPlans ? (
        <>
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          {loading && <p role="status">Loading projects…</p>}
          <ProjectPlanCards model={model} />
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
          <PlanningSectionActions model={model} />
        </section>
      )}
    </div>
  );
}
