import { useState } from "react";
import { requestProjectAccess, type ProjectDirectoryEntry } from "../../api/projects";
import { ProjectDialogFrame } from "../../components/shared/ProjectDialogFrame";
import { RequestAccessHeader } from "../../components/request-access/RequestAccessHeader";
import { RequestAccessForm } from "../../components/request-access/RequestAccessForm";
import { RequestAccessProject } from "../../components/request-access/RequestAccessProject";
import { RequestAccessFields } from "../../components/request-access/RequestAccessFields";
import { RequestAccessRoleField } from "../../components/request-access/RequestAccessRoleField";
import { RequestAccessReasonField } from "../../components/request-access/RequestAccessReasonField";
import { RequestAccessError } from "../../components/request-access/RequestAccessError";
import { RequestAccessActions } from "../../components/request-access/RequestAccessActions";

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
  async function submit() {
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
    <ProjectDialogFrame
      titleId="request-access-title"
      descriptionId="request-access-project"
      busy={busy}
      onClose={onClose}
    >
      <RequestAccessHeader busy={busy} onClose={onClose} />
      <RequestAccessForm onSubmit={submit}>
        <RequestAccessProject project={project} />
        <RequestAccessFields>
          <RequestAccessRoleField role={role} busy={busy} onChange={setRole} />
          <RequestAccessReasonField reason={reason} busy={busy} onChange={setReason} />
        </RequestAccessFields>
        {error && <RequestAccessError message={error} />}
        <RequestAccessActions busy={busy} canSend={Boolean(reason.trim())} onClose={onClose} />
      </RequestAccessForm>
    </ProjectDialogFrame>
  );
}
