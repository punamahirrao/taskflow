import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { useOrganizationSectionPageModel } from "../../features/project-plans/useOrganizationSectionPageModel";

export function PlanningSectionActions({
  model,
}: {
  model: ReturnType<typeof useOrganizationSectionPageModel>;
}) {
  const { pathname, page, selectedId } = model;
  return (
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
  );
}
