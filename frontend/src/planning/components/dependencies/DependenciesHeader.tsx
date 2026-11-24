import { GitBranch, Plus } from "lucide-react";

import type { useDependenciesPageModel } from "../../features/dependencies/useDependenciesPageModel";
export function DependenciesHeader({
  model,
}: {
  model: ReturnType<typeof useDependenciesPageModel>;
}) {
  const { loading, error, setCreating, editableProjects } = model;
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <GitBranch className="text-accent" />
          Dependencies & linked work
        </h1>
        <p className="mt-2 text-sm text-muted">
          Connect work items to the prerequisites they depend on.
        </p>
      </div>
      {editableProjects.length > 0 && (
        <button
          type="button"
          disabled={loading || Boolean(error)}
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus size={16} /> Create dependency
        </button>
      )}
    </header>
  );
}
