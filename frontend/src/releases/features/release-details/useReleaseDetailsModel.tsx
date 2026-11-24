import { useState } from "react";
import { useChangeReleaseMutation } from "../../api/releases";
import type { Approver, Release, ReleaseAction } from "../../entities/release";

export function useReleaseDetailsModel({
  release,
  members,
  canManage,
  onEdit,
}: {
  release: Release;
  members: Approver[];
  canManage: boolean;
  onEdit: () => void;
}) {
  const [change, result] = useChangeReleaseMutation();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [reassignId, setReassignId] = useState<number | null>(null);
  const [assignee, setAssignee] = useState(0);
  const [showTasks, setShowTasks] = useState(false);
  const done = release.tasks.filter((task) => task.status === "done").length;
  const approved = release.steps.filter((step) => step.status === "approved").length;
  const active = release.steps.find((step) => step.id === release.active_step_id);
  const canEdit =
    canManage &&
    (release.state === "planned" || (release.state === "in_progress" && !release.steps.length));

  async function act(input: ReleaseAction) {
    if (result.isLoading) return;
    setError("");
    try {
      await change({ id: release.id, input }).unwrap();
      setNote("");
      setReassignId(null);
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not update the release.",
      );
    }
  }

  return {
    result,
    note,
    setNote,
    error,
    reassignId,
    setReassignId,
    assignee,
    setAssignee,
    showTasks,
    setShowTasks,
    done,
    approved,
    active,
    canEdit,
    act,
    release,
    members,
    canManage,
    onEdit,
  };
}
