import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useDialogBehavior } from "../../common/shared/hooks/useDialogBehavior";
import { requestProjectAccess, type ProjectDirectoryEntry } from "../api/projects";
import { ProjectOwner } from "../components/ProjectOwner";
import {
  CreateProjectOverlay,
  CreateProjectPanel,
  CreateProjectHeader,
  CreateProjectTitle,
  CreateProjectCloseButton,
  CreateProjectForm,
  CreateProjectFields,
  CreateProjectField,
  CreateProjectLabel,
  CreateProjectSelect,
  CreateProjectError,
  CreateProjectActions,
  CreateProjectCancelButton,
  CreateProjectSubmitButton,
} from "../Projects.styles";

export function RequestAccessDialog({
  project,
  onClose,
  onSent,
}: {
  project: ProjectDirectoryEntry;
  onClose: () => void;
  onSent: () => void;
}) {
  const [role, setRole] = useState<"member" | "viewer">("member");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useDialogBehavior(onClose, busy);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Tell the project owner why you need access.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestProjectAccess(project.id, { requested_role: role, reason: reason.trim() });
      onSent();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not send your request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <CreateProjectOverlay
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <CreateProjectPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-access-title"
        aria-describedby="request-access-project"
      >
        <CreateProjectHeader>
          <CreateProjectTitle id="request-access-title">Request project access</CreateProjectTitle>
          <CreateProjectCloseButton
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close access request"
          >
            <X size={20} />
          </CreateProjectCloseButton>
        </CreateProjectHeader>
        <CreateProjectForm onSubmit={(event) => void submit(event)}>
          <p id="request-access-project" className="mb-3 font-semibold">
            {project.name}
          </p>
          <ProjectOwner owner={project.owner_details} />
          <CreateProjectFields className="mt-4">
            <CreateProjectField>
              <CreateProjectLabel htmlFor="request-role">Access level</CreateProjectLabel>
              <CreateProjectSelect
                id="request-role"
                value={role}
                disabled={busy}
                onChange={(event) => setRole(event.target.value as typeof role)}
              >
                <option value="member">Member — contribute to project work</option>
                <option value="viewer">Viewer — read project work</option>
              </CreateProjectSelect>
            </CreateProjectField>
            <CreateProjectField>
              <CreateProjectLabel htmlFor="request-reason">
                Why do you need access?
              </CreateProjectLabel>
              <textarea
                id="request-reason"
                className="project-request-reason"
                required
                maxLength={1000}
                rows={4}
                value={reason}
                disabled={busy}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Briefly describe how you’ll be involved…"
              />
            </CreateProjectField>
          </CreateProjectFields>
          {error && <CreateProjectError role="alert">{error}</CreateProjectError>}
          <CreateProjectActions>
            <CreateProjectCancelButton type="button" onClick={onClose} disabled={busy}>
              Cancel
            </CreateProjectCancelButton>
            <CreateProjectSubmitButton type="submit" disabled={busy || !reason.trim()}>
              {busy ? "Sending…" : "Send request"}
            </CreateProjectSubmitButton>
          </CreateProjectActions>
        </CreateProjectForm>
      </CreateProjectPanel>
    </CreateProjectOverlay>
  );
}
