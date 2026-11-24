import { Plus } from "lucide-react";
export function WorkTaskCreateButton({
  disabled,
  needsProject,
  onCreate,
}: {
  disabled: boolean;
  needsProject: boolean;
  onCreate: () => void;
}) {
  return (
    <button
      type="button"
      className="my-work-button primary"
      disabled={disabled}
      title={needsProject ? "Join a project with task creation access to add a task" : undefined}
      onClick={onCreate}
    >
      <Plus size={17} /> Create task
    </button>
  );
}
