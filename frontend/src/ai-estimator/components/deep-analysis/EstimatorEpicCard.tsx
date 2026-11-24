import { ChevronDown, ListChecks, Plus, Trash2 } from "lucide-react";
import type { Epic } from "../../entities/estimator";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import { EstimatorNumberField, EstimatorTextField } from "../shared/EstimatorFields";
export function EstimatorEpicCard({
  model,
  epic,
  expanded,
  epicPoints,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
  epic: Epic;
  expanded: boolean;
  epicPoints: number;
}) {
  const { t, toggleEpic, addEpicStory, updateEpic, updateEpicStory, deleteEpic, deleteEpicStory } =
    model;
  return (
    <article key={epic.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 p-4 sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4 text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <ListChecks size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-indigo-600">
              {t("aiEstimator.epicBadge", { id: epic.id })}
            </span>
            <EstimatorTextField
              id={`epic-title-${epic.id}`}
              testId={`epic-title-${epic.id}`}
              label={t("aiEstimator.epicTitle", { id: epic.id })}
              value={epic.title}
              onClick={(event) => event.stopPropagation()}
              onChange={(value) => updateEpic(epic.id, { title: value })}
              className="mt-1 block w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
            />
            <EstimatorTextField
              id={`epic-description-${epic.id}`}
              testId={`epic-description-${epic.id}`}
              label={t("aiEstimator.epicDescription", { id: epic.id })}
              value={epic.description}
              onClick={(event) => event.stopPropagation()}
              onChange={(value) => updateEpic(epic.id, { description: value })}
              className="mt-1 block w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-slate-500 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
            />
          </span>
        </div>
        <button
          type="button"
          onClick={() => addEpicStory(epic.id)}
          aria-label={t("aiEstimator.addStoryTo", { title: epic.title })}
          title={t("aiEstimator.quickAddToEpic")}
          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
        >
          <Plus size={17} />
        </button>
        <EstimatorNumberField
          id={`epic-points-${epic.id}`}
          testId={`epic-points-${epic.id}`}
          label={t("aiEstimator.epicStoryPoints", { id: epic.id })}
          value={epicPoints}
          onChange={(desired) => {
            const current = epic.stories.reduce((sum, story) => sum + story.points, 0);
            const delta = desired - current;
            if (epic.stories.length)
              updateEpicStory(epic.id, epic.stories[0].id, {
                points: Math.max(0, epic.stories[0].points + delta),
              });
          }}
          className="w-12 bg-transparent text-right outline-none"
          wrapperClassName="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700"
          suffix={t("aiEstimator.pts")}
        />
        <button
          type="button"
          onClick={() => deleteEpic(epic.id)}
          aria-label={t("aiEstimator.deleteEpic", { id: epic.id })}
          title={t("aiEstimator.deleteEpicAndStories")}
          className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={16} />
        </button>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? t("aiEstimator.collapseEpic") : t("aiEstimator.expandEpic")}
          onClick={() => toggleEpic(epic.id)}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
        >
          <ChevronDown
            size={18}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4 sm:pl-[4.5rem]">
          {epic.stories.map((story) => (
            <div
              key={story.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="shrink-0 text-xs font-semibold text-slate-400">{story.id}</span>
              <EstimatorTextField
                id={`user-story-title-${story.id}`}
                testId={`user-story-title-${story.id}`}
                label={t("aiEstimator.storyTitle", { id: story.id })}
                value={story.title}
                onChange={(value) => updateEpicStory(epic.id, story.id, { title: value })}
                className="min-w-0 flex-1 rounded border border-transparent px-2 py-1 text-sm font-medium text-slate-700 hover:border-slate-200 focus:border-indigo-300 focus:outline-none"
              />
              <EstimatorNumberField
                id={`user-story-points-${story.id}`}
                testId={`user-story-points-${story.id}`}
                label={t("aiEstimator.storyPoints", { id: story.id })}
                value={story.points}
                onChange={(value) => updateEpicStory(epic.id, story.id, { points: value })}
                className="w-9 bg-transparent text-right outline-none"
                wrapperClassName="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                suffix={t("aiEstimator.pts")}
              />
              <button
                type="button"
                onClick={() => deleteEpicStory(epic.id, story.id)}
                aria-label={t("aiEstimator.deleteStory", { id: story.id })}
                className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
