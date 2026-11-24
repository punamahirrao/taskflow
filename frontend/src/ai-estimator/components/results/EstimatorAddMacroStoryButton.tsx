import { Plus } from "lucide-react";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorAddMacroStoryButton({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { t, addMacroStory } = model;
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={addMacroStory}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
      >
        <Plus size={16} />
        {t("aiEstimator.quickAddStory")}
      </button>
    </div>
  );
}
