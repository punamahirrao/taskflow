import { CreateProjectField, CreateProjectLabel } from "../../Projects.styles";

export function RequestAccessReasonField({
  reason,
  busy,
  onChange,
}: {
  reason: string;
  busy: boolean;
  onChange: (reason: string) => void;
}) {
  return (
    <CreateProjectField>
      <CreateProjectLabel htmlFor="request-reason">Why do you need access?</CreateProjectLabel>
      <textarea
        id="request-reason"
        className="project-request-reason"
        required
        maxLength={1000}
        rows={4}
        value={reason}
        disabled={busy}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Briefly describe how you’ll be involved…"
      />
    </CreateProjectField>
  );
}
