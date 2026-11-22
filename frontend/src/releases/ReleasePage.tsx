import { ReleaseStyles } from "./Releases.styles";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ClipboardCheck, Flag, Plus, Rocket } from "lucide-react";
import { dataScope } from "../common/api/queryApi";
import { useReleasesQuery } from "./api/releases";
import type { Release } from "./entities/release";
import { formatDate, releaseLabels } from "./utils/releaseDisplay";
import { ReleaseDetails } from "./components/ReleaseDetails";
import { ReleaseForm } from "./components/ReleaseForm";

const stateOrder = ["in_progress", "changes_requested", "ready", "planned", "done"];

export default function ReleasePage() {
  const query = useReleasesQuery(dataScope());
  const { currentData } = query;
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Release | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const items = [...(currentData?.items ?? [])].sort(
    (a, b) => stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state),
  );
  const visible = items.filter(
    (release) =>
      (!filter || release.state === filter) &&
      `${release.name} ${release.goals.map((goal) => goal.name).join(" ")}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const selected =
    visible.find((release) => String(release.id) === params.get("release")) ?? visible[0];
  const numberInReview = items.filter((item) => item.state === "in_progress").length;
  const numberReady = items.filter((item) => item.state === "ready").length;

  return (
    <main className="release-page" data-testid="page-releases">
      <ReleaseStyles />
      <header className="release-header">
        <div>
          <h1>
            <Rocket size={27} /> Releases
          </h1>
          <p>Plan delivery, track linked work, and collect sign-offs.</p>
        </div>
        {currentData?.can_manage && (
          <button
            type="button"
            className="release-button primary"
            onClick={() => setEditing("new")}
          >
            <Plus size={18} /> Create release
          </button>
        )}
      </header>
      {query.error && (
        <p role="alert" className="release-error">
          Could not load releases.{" "}
          <button type="button" className="release-link" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      )}
      {!currentData && query.isFetching && (
        <p role="status" className="release-muted">
          Loading releases…
        </p>
      )}
      {currentData && (
        <>
          <div className="release-summary">
            <span>
              <Flag size={19} /> <b>{items.length}</b> releases
            </span>
            <span>
              <ClipboardCheck size={19} /> <b>{numberInReview}</b> in progress
            </span>
            <span>
              <Check size={19} /> <b>{numberReady}</b> ready to release
            </span>
          </div>
          <div className="release-layout">
            <section className="release-panel" aria-labelledby="release-list-title">
              <header className="release-panel-heading">
                <h2 id="release-list-title">Release list</h2>
              </header>
              <div className="release-filters">
                <input
                  type="search"
                  aria-label="Search releases or goals"
                  placeholder="Search releases or goals…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  aria-label="Filter by release status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="">All statuses</option>
                  {Object.entries(releaseLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {visible.length ? (
                <ul className="release-list">
                  {visible.map((release) => (
                    <li key={release.id}>
                      <button
                        type="button"
                        aria-pressed={release.id === selected?.id}
                        onClick={() => setParams({ release: String(release.id) })}
                      >
                        <strong>{release.name}</strong>
                        <span>
                          <small>{formatDate(release.target_date)}</small>
                          <span className={`release-badge ${release.state}`}>
                            {releaseLabels[release.state]}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="release-detail-body release-muted">
                  {items.length
                    ? "No releases match the current filters."
                    : "Create a release to start planning delivery."}
                </p>
              )}
            </section>
            {selected && (
              <ReleaseDetails
                key={selected.id}
                release={selected}
                canManage={currentData.can_manage}
                members={currentData.members}
                onEdit={() => setEditing(selected)}
              />
            )}
          </div>
        </>
      )}
      {editing && currentData && (
        <ReleaseForm
          release={editing === "new" ? undefined : editing}
          members={currentData.members}
          goals={currentData.goals}
          onClose={() => setEditing(null)}
          onSaved={(release) => {
            setParams({ release: String(release.id) });
            setEditing(null);
            setFilter("");
            setSearch("");
          }}
        />
      )}
    </main>
  );
}
