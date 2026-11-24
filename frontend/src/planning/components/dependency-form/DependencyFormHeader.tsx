import { GitBranch, X } from "lucide-react";
import type { useDependencyFormModel } from "../../features/dependency-form/useDependencyFormModel";

export function DependencyFormHeader({
  model,
}: {
  model: ReturnType<typeof useDependencyFormModel>;
}) {
  const { isLoading, onClose } = model;
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 id="dependency-form-title" className="flex items-center gap-2 text-xl font-semibold">
          <GitBranch size={20} className="text-accent" /> Create dependency
        </h2>
        <p className="mt-2 text-sm text-muted">Choose the work that must finish first.</p>
      </div>
      <button
        type="button"
        aria-label="Close dependency form"
        disabled={isLoading}
        onClick={onClose}
        className="rounded p-1 text-muted hover:bg-subtle"
      >
        <X size={20} />
      </button>
    </header>
  );
}
