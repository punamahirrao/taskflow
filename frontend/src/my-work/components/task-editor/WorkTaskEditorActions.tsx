export function WorkTaskEditorActions({
  editing,
  busy,
  hasProject,
  onClose,
}: {
  editing: boolean;
  busy: boolean;
  hasProject: boolean;
  onClose: () => void;
}) {
  return (
    <footer className="my-work-actions">
      <button type="button" className="my-work-button" disabled={busy} onClick={onClose}>
        Cancel
      </button>
      <button type="submit" className="my-work-button primary" disabled={busy || !hasProject}>
        {busy ? "Saving…" : editing ? "Save changes" : "Create task"}
      </button>
    </footer>
  );
}
