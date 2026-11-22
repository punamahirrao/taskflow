import { dataScope } from "../../common/api/queryApi";
import { useBillingUsageQuery } from "../api/administrationQueries";
import { useOrganization } from "../../organizations/context/OrganizationContext";

function Usage() {
  const { currentData: usage, isFetching, error, refetch } = useBillingUsageQuery(dataScope());
  if (error)
    return (
      <section className="settings-panel">
        <p role="alert">Could not load usage.</p>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </section>
    );
  if (!usage)
    return (
      <section className="settings-panel" role="status">
        {isFetching ? "Loading usage…" : "No usage information."}
      </section>
    );
  return (
    <section className="settings-panel">
      <h3 className="text-lg font-semibold">{usage.organization} usage</h3>
      <p className="my-3 text-sm text-muted">
        Data environment: {usage.environment}. A payment provider and subscription record have not
        been configured. Checkout and invoices are unavailable.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          ["Users", usage.users],
          ["Projects", usage.projects],
          ["Work items", usage.work_items],
          ["Boards", usage.boards],
          ["Document storage", `${(usage.storage_bytes / 1024).toFixed(1)} KB`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line p-4">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-2 text-xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
export default function BillingUsage() {
  const { activeOrganization } = useOrganization();
  return activeOrganization?.role === "owner" || activeOrganization?.role === "admin" ? (
    <Usage />
  ) : (
    <section className="settings-panel">
      Billing information is available to organization administrators.
    </section>
  );
}
