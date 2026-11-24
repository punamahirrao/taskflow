import { Plus, Rocket } from "lucide-react";
import type { useReleasePageModel } from "../../features/release/useReleasePageModel";

export function ReleaseHeader({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { currentData, setEditing } = model;
  return (
    <header className="release-header">
      <div>
        <h1>
          <Rocket size={27} /> Releases
        </h1>
        <p>Plan delivery, track linked work, and collect sign-offs.</p>
      </div>
      {currentData?.can_manage && (
        <button type="button" className="release-button primary" onClick={() => setEditing("new")}>
          <Plus size={18} /> Create release
        </button>
      )}
    </header>
  );
}
