import { CreateProjectField, CreateProjectLabel, CreateProjectSelect } from "../../Projects.styles";

export function RequestAccessRoleField({
  role,
  busy,
  onChange,
}: {
  role: "member" | "viewer";
  busy: boolean;
  onChange: (role: "member" | "viewer") => void;
}) {
  return (
    <CreateProjectField>
      <CreateProjectLabel htmlFor="request-role">Access level</CreateProjectLabel>
      <CreateProjectSelect
        id="request-role"
        value={role}
        disabled={busy}
        onChange={(event) => onChange(event.target.value as typeof role)}
      >
        <option value="member">Member — contribute to project work</option>
        <option value="viewer">Viewer — read project work</option>
      </CreateProjectSelect>
    </CreateProjectField>
  );
}
