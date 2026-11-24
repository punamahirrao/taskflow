import type { useReleasePageModel } from "../../features/release/useReleasePageModel";
import { releaseLabels } from "../../utils/releaseDisplay";

export function ReleaseFilters({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { search, setSearch, filter, setFilter } = model;
  return (
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
  );
}
