import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { useOrganizationSectionPageModel } from "../../features/project-plans/useOrganizationSectionPageModel";

export function ProjectPlansHeader({
  model,
}: {
  model: ReturnType<typeof useOrganizationSectionPageModel>;
}) {
  const { page } = model;
  return (
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
  );
}
