import { useEffect, useRef } from "react";
import type { WorkTimeDraft } from "../../entities/workTime";
import { WorkTimeForm } from "./WorkTimeForm";
export function WorkTimeDialog({
  maxDate,
  error,
  onSubmit,
  onClose,
}: {
  maxDate: string;
  error: string;
  onSubmit: (entry: WorkTimeDraft) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="my-work-dialog"
      aria-labelledby="my-work-time-title"
      onCancel={onClose}
    >
      <header className="my-work-panel-heading">
        <h2 id="my-work-time-title">Log my time</h2>
      </header>
      <WorkTimeForm maxDate={maxDate} error={error} onSubmit={onSubmit} onClose={onClose} />
    </dialog>
  );
}
