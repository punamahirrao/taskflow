import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { usePlanningPageModel } from "../../features/records/usePlanningPageModel";
const labels = {
  release: "Releases",
  goal: "Goals",
  milestone: "Milestones",
  template: "Templates",
};

export function PlanningRecordsTable({
  model,
}: {
  model: ReturnType<typeof usePlanningPageModel>;
}) {
  const { currentData, setEditing, items, kind } = model;
  return (
    <div className="overflow-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{labels[kind]}</caption>
        <thead className="bg-subtle">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Status</th>
            <th className="p-4">Target</th>
            <th className="p-4">Work items</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-line">
              <td className="p-4">
                <b>{item.name}</b>
                <p className="mt-1 max-w-lg whitespace-pre-wrap text-xs text-muted">
                  {item.description}
                </p>
                {kind === "goal" && !!item.related_releases?.length && (
                  <ul className="mt-2 flex flex-wrap gap-2" aria-label="Linked releases">
                    {item.related_releases.map((release) => (
                      <li key={release.id}>
                        <Link
                          className="rounded border border-line px-2 py-1 text-xs underline"
                          to={`/releases?release=${release.id}`}
                        >
                          {release.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="p-4">{item.status.replaceAll("_", " ")}</td>
              <td className="p-4">{item.target_date ?? "Unscheduled"}</td>
              <td className="p-4">
                <Link to="/backlog" className="text-accent">
                  {item.tasks.length} linked
                </Link>
              </td>
              <td className="p-4">
                {currentData?.can_manage && (
                  <button
                    type="button"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => setEditing(item)}
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted">
                No records match this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
