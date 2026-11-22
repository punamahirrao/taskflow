import { useState } from "react";
import { useOrganization } from "../../organizations/context/OrganizationContext";
import { dataScope } from "../../common/api/queryApi";
import { useAuditQuery } from "../api/administrationQueries";

function AuditTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { currentData, isFetching, error, refetch } = useAuditQuery({
    ...dataScope(),
    search,
    page,
  });
  return (
    <section className="settings-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="text-sm">
          Search audit records
          <input
            type="search"
            className="ml-3 rounded border border-line bg-canvas p-2"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <button type="button" onClick={() => void refetch()}>
          Refresh
        </button>
      </div>
      {error ? (
        <p role="alert">Could not load audit records.</p>
      ) : (
        <>
          <div className="mt-5 overflow-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Organization audit log</caption>
              <thead>
                <tr>
                  {["When", "Actor", "Action", "Entity", "Summary"].map((label) => (
                    <th key={label} className="p-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData?.results.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="whitespace-nowrap p-3">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">{item.actor}</td>
                    <td className="p-3">{item.action}</td>
                    <td className="p-3">
                      {item.entity_type} #{item.entity_id}
                    </td>
                    <td className="p-3">{item.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isFetching && <p role="status">Loading records…</p>}
          {!isFetching && !currentData?.count && (
            <p className="my-4 text-sm text-muted">No audit records match this view.</p>
          )}
          <div className="mt-4 flex justify-end gap-4">
            <button
              type="button"
              disabled={page === 1 || isFetching}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              type="button"
              disabled={!currentData || page * 25 >= currentData.count || isFetching}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
export default function AuditLog() {
  const { activeOrganization } = useOrganization();
  return activeOrganization?.role === "owner" || activeOrganization?.role === "admin" ? (
    <AuditTable />
  ) : (
    <section className="settings-panel">
      <p>Audit records are available to organization owners and administrators.</p>
    </section>
  );
}
