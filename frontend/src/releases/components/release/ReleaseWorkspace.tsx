import type { useReleasePageModel } from "../../features/release/useReleasePageModel";
import { ReleaseDetails } from "../../features/release-details/ReleaseDetails";
import { ReleaseList } from "./ReleaseList";

export function ReleaseWorkspace({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { currentData, setEditing, selected } = model;
  if (!currentData) return null;
  return (
    <div className="release-layout">
      <ReleaseList model={model} />
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
  );
}
