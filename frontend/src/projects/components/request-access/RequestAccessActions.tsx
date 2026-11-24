import {
  CreateProjectActions,
  CreateProjectCancelButton,
  CreateProjectSubmitButton,
} from "../../Projects.styles";

export function RequestAccessActions({
  busy,
  canSend,
  onClose,
}: {
  busy: boolean;
  canSend: boolean;
  onClose: () => void;
}) {
  return (
    <CreateProjectActions>
      <CreateProjectCancelButton type="button" onClick={onClose} disabled={busy}>
        Cancel
      </CreateProjectCancelButton>
      <CreateProjectSubmitButton type="submit" disabled={busy || !canSend}>
        {busy ? "Sending…" : "Send request"}
      </CreateProjectSubmitButton>
    </CreateProjectActions>
  );
}
