import type { WorkflowTab, WorkflowTabOption } from "../../entities/sprintTrain";

export function WorkflowTabButton({
  tab,
  active,
  onSelect,
}: {
  tab: WorkflowTabOption;
  active: boolean;
  onSelect: (tab: WorkflowTab) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tab.id)}
      className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${active ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
    >
      {tab.label}
    </button>
  );
}
