import { Plus } from "lucide-react";
import type { usePlanningPageModel } from "../../features/records/usePlanningPageModel";
const labels = {
  release: "Releases",
  goal: "Goals",
  milestone: "Milestones",
  template: "Templates",
};

export function PlanningHeader({ model }: { model: ReturnType<typeof usePlanningPageModel> }) {
  const { currentData, setEditing, Icon, kind } = model;
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <Icon className="text-accent" />
          {labels[kind]}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {kind === "template"
            ? "Reusable planning briefs and checklists. Templates are reference records; automatic project generation is not enabled."
            : kind === "milestone"
              ? "Set delivery checkpoints, target dates and the work needed to reach them."
              : "Organization delivery targets linked to project work."}
        </p>
      </div>
      {currentData?.can_manage && (
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setEditing("new")}
        >
          <Plus size={16} />
          Create {kind}
        </button>
      )}
    </header>
  );
}
