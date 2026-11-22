import { useState, type FormEvent } from "react";
import { createOrganization } from "../api/organizations";

export default function OrganizationForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createOrganization(name.trim());
      await onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Organization could not be created.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="organization-form" onSubmit={submit}>
      <label htmlFor="organization-name">
        Organization name <span aria-hidden="true">*</span>
      </label>
      <input
        id="organization-name"
        name="organization_name"
        autoComplete="organization"
        required
        maxLength={100}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Acme Company"
      />
      <p>Projects, boards, tasks and documents stay within this organization.</p>
      {error && (
        <p className="organization-error" role="alert">
          {error}
        </p>
      )}
      <div className="organization-form-actions">
        {onCancel && (
          <button
            type="button"
            className="organization-secondary"
            disabled={saving}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button className="organization-primary" type="submit" disabled={saving || !name.trim()}>
          {saving ? "Creating…" : "Create organization"}
        </button>
      </div>
    </form>
  );
}
