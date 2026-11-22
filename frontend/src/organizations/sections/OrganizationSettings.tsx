import { useEffect, useRef, useState } from "react";
import { Building2, Check, Plus, Search, X } from "lucide-react";
import { useOrganization } from "../context/OrganizationContext";
import OrganizationForm from "../components/OrganizationForm";

function CreateOrganizationDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { reload } = useOrganization();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="organization-dialog"
      aria-labelledby="create-organization-title"
      onCancel={onClose}
    >
      <div className="organization-dialog-heading">
        <h2 id="create-organization-title">Create new organization</h2>
        <button type="button" aria-label="Close create organization" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <OrganizationForm
        onCancel={onClose}
        onCreated={async () => {
          await reload();
          onClose();
        }}
      />
    </dialog>
  );
}

export default function OrganizationSettings() {
  const { organizations, activeOrganization, limit, switching, switchOrganization } =
    useOrganization();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const matches = organizations.filter((item) =>
    item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <section className="settings-panel organization-settings" data-testid="organization-settings">
      <div className="organization-table-heading">
        <div>
          <h3>Your organizations</h3>
          <p>
            {organizations.length} of {limit} organizations · Each organization has its own projects
            and data.
          </p>
        </div>
        <button
          className="organization-primary"
          type="button"
          disabled={organizations.length >= limit}
          onClick={() => setCreating(true)}
        >
          <Plus size={16} />
          Create new organization
        </button>
      </div>
      <div className="organization-toolbar">
        <label className="shell-search">
          <Search size={17} />
          <input
            type="search"
            aria-label="Search organizations"
            placeholder="Search organizations…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {organizations.length >= limit && <span>You’ve reached the two-organization limit.</span>}
      </div>
      {error && (
        <p className="organization-error" role="alert">
          {error}
        </p>
      )}
      <div className="organization-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Organization</th>
              <th scope="col">Projects</th>
              <th scope="col">Created</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((organization) => (
              <tr key={organization.id}>
                <td>
                  <span className="organization-table-name">
                    <Building2 size={20} />
                    {organization.name}
                  </span>
                </td>
                <td>{organization.project_count}</td>
                <td>{new Date(organization.created_at).toLocaleDateString()}</td>
                <td>
                  {organization.id === activeOrganization?.id ? (
                    <span className="organization-active">
                      <Check size={13} />
                      Active
                    </span>
                  ) : (
                    <span className="organization-inactive">Available</span>
                  )}
                </td>
                <td>
                  {organization.id !== activeOrganization?.id && (
                    <button
                      type="button"
                      className="organization-secondary"
                      disabled={switching}
                      aria-label={`Switch to ${organization.name}`}
                      onClick={() => {
                        setError("");
                        void switchOrganization(organization.id).catch((cause: unknown) =>
                          setError(
                            cause instanceof Error
                              ? cause.message
                              : "Could not switch organization.",
                          ),
                        );
                      }}
                    >
                      {switching ? "Switching…" : "Switch"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!matches.length && <p className="organization-empty">No organizations match “{query}”.</p>}
      </div>
      {creating && <CreateOrganizationDialog onClose={() => setCreating(false)} />}
    </section>
  );
}
