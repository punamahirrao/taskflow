import { Plus, TrainFront } from "lucide-react";

export function SprintTrainHeader({
  projectName,
  role,
  drawerOpen,
  storyLabel,
  closeStoryLabel,
  newSprintLabel,
  sectionLabel,
  canCreateSprint,
  onToggleBacklog,
  onCreateSprint,
}: {
  projectName: string;
  role?: string;
  drawerOpen: boolean;
  storyLabel: string;
  closeStoryLabel: string;
  newSprintLabel: string;
  sectionLabel: string;
  canCreateSprint: boolean;
  onToggleBacklog: () => void;
  onCreateSprint: () => void;
}) {
  return (
    <section
      data-testid="app-header"
      className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white"
          aria-hidden="true"
        >
          <TrainFront size={21} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold">{projectName}</h1>
          <p className="text-[calc(10px*var(--taskflow-font-scale,1))] font-medium uppercase tracking-wide text-slate-500">
            {sectionLabel}
          </p>
        </div>
        {role && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-wide text-indigo-700">
            {role}
          </span>
        )}
      </div>
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
    </section>
  );
}
