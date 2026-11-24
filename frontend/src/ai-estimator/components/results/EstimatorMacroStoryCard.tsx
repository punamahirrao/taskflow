import { ListChecks, Trash2 } from "lucide-react";
import type { MacroStory } from "../../entities/estimator";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import {
  EstimatorNumberField,
  EstimatorTextAreaField,
  EstimatorTextField,
} from "../shared/EstimatorFields";
export function EstimatorMacroStoryCard({
  model,
  story,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
  story: MacroStory;
}) {
  const { t, updateMacroStory, deleteMacroStory } = model;
  return (
    <article
      key={story.id}
      className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
        <ListChecks size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-indigo-600">{story.id}</p>
        <EstimatorTextField
          id={`macro-title-${story.id}`}
          testId={`macro-story-title-${story.id}`}
          label={t("aiEstimator.requirementTitle", { id: story.id })}
          value={story.title}
          onChange={(value) => updateMacroStory(story.id, { title: value })}
          className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 py-1 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
        />
        <EstimatorTextAreaField
          id={`macro-description-${story.id}`}
          testId={`macro-story-description-${story.id}`}
          label={t("aiEstimator.requirementDescription", { id: story.id })}
          value={story.description}
          onChange={(value) => updateMacroStory(story.id, { description: value })}
          rows={2}
          className="mt-1 w-full resize-y rounded-md border border-transparent bg-transparent px-1 py-1 text-sm leading-6 text-slate-600 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
        />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <EstimatorNumberField
          id={`macro-points-${story.id}`}
          testId={`macro-story-points-${story.id}`}
          label={t("aiEstimator.storyPoints", { id: story.id })}
          value={story.points}
          onChange={(value) => updateMacroStory(story.id, { points: value })}
          className="w-10 bg-transparent text-right outline-none"
          wrapperClassName="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700"
          suffix={t("aiEstimator.pts")}
        />
        <button
          type="button"
          onClick={() => deleteMacroStory(story.id)}
          aria-label={t("aiEstimator.deleteItem", { id: story.id })}
          title={t("aiEstimator.deleteRequirement")}
          className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
