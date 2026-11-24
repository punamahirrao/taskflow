import { Plus } from "lucide-react";
import type { SprintTrainHeaderProps } from "../../entities/header";

export function SprintTrainActions({
  drawerOpen,
  storyLabel,
  closeStoryLabel,
  newSprintLabel,
  canCreateSprint,
  onToggleBacklog,
  onCreateSprint,
}: Omit<SprintTrainHeaderProps, "projectName" | "role" | "sectionLabel">) {
  return (
    <div className="sprint-train-actions">
      <button
        type="button"
        onClick={onToggleBacklog}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Plus size={16} />
        {drawerOpen ? closeStoryLabel : storyLabel}
      </button>
      <button
        type="button"
        onClick={onCreateSprint}
        disabled={!canCreateSprint}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={16} />
        {newSprintLabel}
      </button>
    </div>
  );
}
