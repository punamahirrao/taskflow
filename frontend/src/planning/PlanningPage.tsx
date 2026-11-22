import { PaddedPage } from "../common/components/styled";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Pencil, Flag, Target, Milestone, LayoutTemplate } from "lucide-react";
import { dataScope } from "../common/api/queryApi";
import { usePlanningQuery } from "./api/planningQuery";
import type { PlanningRecord } from "./entities/planning";
import { PlanningForm } from "./components/PlanningForm";

const labels = {
  release: "Releases",
  goal: "Goals",
  milestone: "Milestones",
  template: "Templates",
};
const icons = { release: Flag, goal: Target, milestone: Milestone, template: LayoutTemplate };

export default function PlanningPage({ kind }: { kind: PlanningRecord["kind"] }) {
  const { currentData, isFetching, error, refetch } = usePlanningQuery({ ...dataScope(), kind });
  const [params] = useSearchParams();
  const selectedGoal = kind === "goal" ? params.get("goal") : null;
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PlanningRecord | "new" | null>(null);
  const Icon = icons[kind];
  const items =
    currentData?.items.filter(
      (item) =>
        (!selectedGoal || String(item.id) === selectedGoal) &&
        `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  return (
    <PaddedPage>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <Icon className="text-accent" />
            {labels[kind]}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {kind === "template"
              ? "Reusable planning briefs and checklists. Templates are reference records; automatic project generation is not enabled."
              : kind === "milestone"
                ? "Set delivery checkpoints, target dates and the work needed to reach them."
                : "Organization delivery targets linked to project work."}
          </p>
        </div>
        {currentData?.can_manage && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setEditing("new")}
          >
            <Plus size={16} />
            Create {kind}
          </button>
        )}
      </header>
      {currentData && !currentData.can_manage && kind === "milestone" && (
        <p className="mb-4 text-sm text-muted">
          Organization owners and administrators can create and edit milestones.
        </p>
      )}
      <input
        type="search"
        aria-label={`Search ${labels[kind]}`}
        placeholder={`Search ${labels[kind].toLowerCase()}…`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-5 w-full max-w-md rounded border border-line bg-surface p-3 text-sm"
      />
      {selectedGoal && (
        <Link to="/goals" className="ml-3 text-sm underline">
          Show all goals
        </Link>
      )}
      {error ? (
        <p role="alert">
          Could not load records.{" "}
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </p>
      ) : !currentData && isFetching ? (
        <p role="status">Loading…</p>
      ) : (
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
      )}
      {editing && (
        <PlanningForm
          key={editing === "new" ? "new" : editing.id}
          kind={kind}
          item={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </PaddedPage>
  );
}
