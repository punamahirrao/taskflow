import { X } from "lucide-react";
export function WorkTaskEditorHeader({
  editing,
  busy,
  onClose,
}: {
  editing: boolean;
  busy: boolean;
  onClose: () => void;
}) {
  return (
    <header className="my-work-panel-heading">
      <h2 id="my-work-task-title">{editing ? "Edit my task" : "Create my task"}</h2>
      <button
        type="button"
        className="my-work-icon-button"
        aria-label="Close task editor"
        disabled={busy}
        onClick={onClose}
      >
        <X size={19} />
      </button>
    </header>
  );
}
