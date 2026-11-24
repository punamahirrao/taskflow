import type { useReleasePageModel } from "../../features/release/useReleasePageModel";
import { ReleaseStyles } from "../../Releases.styles";
import { ReleaseForm } from "../../features/release-form/ReleaseForm";
import { ReleaseHeader } from "./ReleaseHeader";
import { ReleaseLoadError } from "./ReleaseLoadError";
import { ReleaseLoading } from "./ReleaseLoading";
import { ReleaseSummary } from "./ReleaseSummary";
import { ReleaseWorkspace } from "./ReleaseWorkspace";

export function ReleasePageView({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { query, currentData, setParams, editing, setEditing, setSearch, setFilter } = model;
  return (
    <main className="release-page" data-testid="page-releases">
      <ReleaseStyles />
      <ReleaseHeader model={model} />
      {query.error && <ReleaseLoadError model={model} />}
      {!currentData && query.isFetching && <ReleaseLoading />}
      {currentData && (
        <>
          <ReleaseSummary model={model} />
          <ReleaseWorkspace model={model} />
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
