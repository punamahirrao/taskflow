import type { DragEvent, FormEvent } from "react";
import { Bookmark, Filter, Plus, Search, UserRound, X } from "lucide-react";
import Avatar from "../../common/components/Avatar";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { Sprint, Task } from "../../features/tasks/entities/task";
import { points } from "../utils/sprintTrain";

export function BacklogDrawer({
  open,
  createStoryOpen,
  selectedSprint,
  selectedSprintPoints,
  wishlistOnly,
  itemCount,
  newStoryTitle,
  newStoryDescription,
  newStoryEstimate,
  savingStory,
  backlogSearch,
  readyOnly,
  filteredBacklog,
  loading,
  selectedTaskId,
  wishlistSavingId,
  onClose,
  onToggleWishlistView,
  onToggleCreateStory,
  onSubmitStory,
  onStoryTitleChange,
  onStoryDescriptionChange,
  onStoryEstimateChange,
  onSearchChange,
  onToggleReady,
  onDragStart,
  onSelectStory,
  onToggleWishlist,
}: {
  open: boolean;
  createStoryOpen: boolean;
  selectedSprint: Sprint | null;
  selectedSprintPoints: number;
  wishlistOnly: boolean;
  itemCount: number;
  newStoryTitle: string;
  newStoryDescription: string;
  newStoryEstimate: string;
  savingStory: boolean;
  backlogSearch: string;
  readyOnly: boolean;
  filteredBacklog: Task[];
  loading: boolean;
  selectedTaskId: number | null;
  wishlistSavingId: number | null;
  onClose: () => void;
  onToggleWishlistView: () => void;
  onToggleCreateStory: () => void;
  onSubmitStory: (event: FormEvent<HTMLFormElement>) => void;
  onStoryTitleChange: (value: string) => void;
  onStoryDescriptionChange: (value: string) => void;
  onStoryEstimateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onToggleReady: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, taskId: number) => void;
  onSelectStory: (taskId: number) => void;
  onToggleWishlist: (task: Task) => void;
}) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <aside
      aria-label={t("sprintTrain.globalBacklogDrawerAria")}
      className={`sprint-backlog-drawer border-l shadow-2xl ${createStoryOpen ? "is-creating-story" : ""}`}
    >
      <header className="sprint-backlog-header border-b p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-[.15em] text-indigo-300">
              {t("sprintTrain.globalBacklogDrawer")}
            </p>
            <h2 className="mt-1 text-base font-bold">{t("sprintTrain.chooseFromBacklog")}</h2>
          </div>
          <button
            type="button"
            aria-label={t("sprintTrain.closeBacklogDrawer")}
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="sprint-backlog-summary">
          <div className="sprint-backlog-points">
            <p>{t("sprintTrain.selectedSprintPoints")}</p>
            <strong>{t("sprintTrain.points", { points: selectedSprintPoints })}</strong>
          </div>
          <button
            type="button"
            className="sprint-backlog-metric sprint-backlog-wishlist rounded-lg border"
            aria-pressed={wishlistOnly}
            onClick={onToggleWishlistView}
          >
            <span>{t(wishlistOnly ? "sprintTrain.allItems" : "sprintTrain.wishList")}</span>
            <strong>
              {t(itemCount === 1 ? "sprintTrain.itemCount" : "sprintTrain.itemsCount", {
                count: itemCount,
              })}
            </strong>
          </button>
          <button
            type="button"
            disabled={!selectedSprint}
            onClick={onToggleCreateStory}
            aria-expanded={createStoryOpen}
            title={
              selectedSprint
                ? t("sprintTrain.createStoryIn", { name: selectedSprint.name })
                : t("sprintTrain.selectSprintToCreateStory")
            }
            className="sprint-backlog-add-story"
          >
            {createStoryOpen ? <X size={15} /> : <Plus size={15} />}{" "}
            {createStoryOpen ? t("common.cancel") : t("sprintTrain.addStory")}
          </button>
        </div>
        {createStoryOpen && selectedSprint && (
          <form
            onSubmit={onSubmitStory}
            className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3"
          >
            <p className="text-xs font-semibold">
              {t("sprintTrain.newStoryIn", { name: selectedSprint.name })}
            </p>
            <label className="block text-xs font-medium">
              {t("sprintTrain.title")}
              <input
                required
                maxLength={255}
                value={newStoryTitle}
                onChange={(event) => onStoryTitleChange(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium">
              {t("sprintTrain.description")}
              <textarea
                value={newStoryDescription}
                onChange={(event) => onStoryDescriptionChange(event.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium">
              {t("sprintTrain.storyPoints")}
              <input
                type="number"
                min="0"
                step="0.5"
                value={newStoryEstimate}
                onChange={(event) => onStoryEstimateChange(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={savingStory || !newStoryTitle.trim()}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingStory ? t("sprintTrain.savingStory") : t("sprintTrain.addStoryToSprint")}
            </button>
          </form>
        )}
        <div className="mt-3 flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("sprintTrain.searchBacklog")}</span>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={backlogSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("sprintTrain.searchBacklogPlaceholder")}
              className="sprint-backlog-search w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <button
            type="button"
            aria-pressed={readyOnly}
            aria-label={t("sprintTrain.toggleReadyFilter")}
            onClick={onToggleReady}
            className={`sprint-backlog-filter grid size-10 shrink-0 place-items-center rounded-lg border ${readyOnly ? "border-indigo-500 bg-indigo-600 text-white" : "text-slate-500"}`}
          >
            <Filter size={16} />
          </button>
        </div>
        {readyOnly && (
          <p className="mt-2 text-[calc(10px*var(--taskflow-font-scale,1))] text-indigo-200">
            {t("sprintTrain.readyFilterActive")}
          </p>
        )}
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {filteredBacklog.map((task) => (
          <article
            key={task.id}
            draggable
            onDragStart={(event) => onDragStart(event, task.id)}
            onClick={() => onSelectStory(task.id)}
            aria-label={t("sprintTrain.openDetailsFor", { title: task.title })}
            className={`sprint-backlog-card cursor-pointer rounded-lg border p-3 transition hover:border-indigo-400 active:cursor-grabbing ${selectedTaskId === task.id ? "border-indigo-500 ring-2 ring-indigo-200" : ""}`}
          >
            <div className="sprint-backlog-card-top">
              <span className="font-mono text-[calc(10px*var(--taskflow-font-scale,1))] font-bold text-indigo-600">
                NEX-{task.id}
              </span>
              <div className="sprint-backlog-card-badges">
                <span className="sprint-backlog-category rounded-full px-2 py-0.5 text-[calc(9px*var(--taskflow-font-scale,1))] font-medium capitalize">
                  {task.work_type.replaceAll("_", " ")}
                </span>
                {task.tags.map((label) => (
                  <span key={label} className="sprint-backlog-card-label">
                    {label}
                  </span>
                ))}
              </div>
              <div className="sprint-backlog-card-points">
                <button
                  type="button"
                  className="sprint-wishlist-toggle"
                  aria-pressed={Boolean(task.is_wishlisted)}
                  aria-label={t(
                    task.is_wishlisted
                      ? "sprintTrain.removeFromWishList"
                      : "sprintTrain.addToWishList",
                    { title: task.title },
                  )}
                  disabled={wishlistSavingId !== null}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleWishlist(task);
                  }}
                >
                  <Bookmark
                    size={16}
                    aria-hidden="true"
                    fill={task.is_wishlisted ? "currentColor" : "none"}
                  />
                </button>
                {task.assignee != null ? (
                  <Avatar
                    name={task.assignee_name || t("sprintTrain.assignedTo")}
                    photoUrl={task.assignee_photo_url}
                    size={24}
                  />
                ) : (
                  <span
                    className="sprint-unassigned-avatar"
                    role="img"
                    aria-label="Unassigned profile picture"
                  >
                    <UserRound size={15} />
                  </span>
                )}
                <span className="whitespace-nowrap rounded-full bg-amber-500/20 px-2 py-0.5 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold text-amber-300">
                  {t("sprintTrain.points", { points: points(task) })}
                </span>
              </div>
            </div>
            <h3 className="sprint-backlog-title mt-2 text-sm font-semibold leading-5">
              {task.title}
            </h3>
          </article>
        ))}
        {!filteredBacklog.length && (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
            {loading ? t("sprintTrain.loadingBacklog") : t("sprintTrain.noBacklogMatches")}
          </div>
        )}
      </div>
    </aside>
  );
}
