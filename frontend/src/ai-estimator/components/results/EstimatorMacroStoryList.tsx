import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import { EstimatorMacroStoryCard } from "./EstimatorMacroStoryCard";

export function EstimatorMacroStoryList({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const { macroStories } = model;
  return (
    <div className="space-y-3">
      {macroStories.map((story) => (
        <EstimatorMacroStoryCard key={story.id} model={model} story={story} />
      ))}
    </div>
  );
}
