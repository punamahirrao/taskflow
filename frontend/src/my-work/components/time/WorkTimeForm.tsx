import type { FormEvent } from "react";
import type { WorkTimeDraft, WorkTimeCategory } from "../../entities/workTime";
import { WorkTimeDateFields } from "./WorkTimeDateFields";
import { WorkTimeDetailsFields } from "./WorkTimeDetailsFields";
import { WorkTimeFormActions } from "./WorkTimeFormActions";
export function WorkTimeForm({
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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      date: String(form.get("date")),
      minutes: Number(form.get("minutes")),
      category: form.get("category") as WorkTimeCategory,
      note: String(form.get("note")).trim(),
    });
  }
  return (
    <form className="my-work-form" onSubmit={submit}>
      <WorkTimeDateFields maxDate={maxDate} />
      <WorkTimeDetailsFields />
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <WorkTimeFormActions onClose={onClose} />
    </form>
  );
}
