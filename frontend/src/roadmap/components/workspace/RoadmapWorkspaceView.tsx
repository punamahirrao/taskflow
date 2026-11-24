import { CalendarDays, CheckCircle2, GitBranch, Layers, List, Search, Timer } from "lucide-react";
import RoadmapFeatureDialog from "../feature-dialog/RoadmapFeatureDialog";
import RoadmapNetwork from "../network/RoadmapNetwork";
import RoadmapStories from "../stories/RoadmapStories";
import RoadmapTimeline from "../timeline/RoadmapTimeline";
import { DependencyTable, Insight } from "./WorkspaceDetails";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
import { RoadmapCriticalPath } from "./RoadmapCriticalPath";
import { RoadmapCycleNotice } from "./RoadmapCycleNotice";
import { RoadmapFeaturesEmpty } from "./RoadmapFeaturesEmpty";
import { RoadmapFeatureTable } from "./RoadmapFeatureTable";
import { RoadmapPermissionsNotice } from "./RoadmapPermissionsNotice";
import { RoadmapPlanHeading } from "./RoadmapPlanHeading";
import { RoadmapScheduleNotice } from "./RoadmapScheduleNotice";
import { RoadmapSelectedFeature } from "./RoadmapSelectedFeature";
import { RoadmapToolbar } from "./RoadmapToolbar";
import { RoadmapUnscheduledNotice } from "./RoadmapUnscheduledNotice";
import { RoadmapViewTabs } from "./RoadmapViewTabs";
import { RoadmapWorkspaceError } from "./RoadmapWorkspaceError";
import { RoadmapWorkspaceLoading } from "./RoadmapWorkspaceLoading";
export function RoadmapWorkspaceView({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const {
    tasks,
    loading,
    error,
    view,
    tab,
    setTab,
    query,
    setQuery,
    allWork,
    setAllWork,
    showCritical,
    setShowCritical,
    selectedId,
    setSelectedId,
    editing,
    setEditing,
    showInsights,
    newFeatureStart,
    canWrite,
    storyFeatures,
    storyFeature,
    plan,
    completionPercent,
    filtered,
    visiblePlan,
    selected,
    addFeature,
    save,
    saveSchedule,
    createStory,
    toggleStory,
    exportCsv,
  } = model;
  return (
    <section
      className={`roadmap-content ${view === "timeline" ? "is-calendar-view" : ""} ${showInsights ? "show-insights" : ""}`}
    >
      <RoadmapPlanHeading model={model} />
      <RoadmapViewTabs model={model} />
      <RoadmapToolbar model={model} />
      {error && <RoadmapWorkspaceError model={model} />}
      {!canWrite && <RoadmapPermissionsNotice />}
      {plan.hasCycle && <RoadmapCycleNotice />}
      {plan.conflicts > 0 && <RoadmapScheduleNotice model={model} />}
      {plan.externalCount > 0 && <RoadmapUnscheduledNotice model={model} />}
      {loading ? (
        <RoadmapWorkspaceLoading />
      ) : !plan.nodes.length && view !== "timeline" ? (
        <RoadmapFeaturesEmpty model={model} />
      ) : (
        <>
          <div className="roadmap-planning-grid">
            <div className="roadmap-main-column">
              <div className="roadmap-visual-panel">
                {view === "network" && !filtered.length ? (
                  <div className="roadmap-empty">
                    <Search size={28} />
                    <h3>No matching features</h3>
                    <p>Try a different name, ID or week number.</p>
                    <button type="button" className="roadmap-button" onClick={() => setQuery("")}>
                      Clear search
                    </button>
                  </div>
                ) : view === "network" ? (
                  <RoadmapNetwork
                    plan={visiblePlan}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    showCritical={showCritical}
                  />
                ) : (
                  <RoadmapTimeline
                    plan={visiblePlan}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    showCritical={showCritical}
                    canWrite={canWrite}
                    onSchedule={saveSchedule}
                    onAdd={addFeature}
                    onEdit={setEditing}
                    onExport={exportCsv}
                    query={query}
                    onQuery={setQuery}
                    allWork={allWork}
                    onAllWork={setAllWork}
                    onCritical={setShowCritical}
                  />
                )}
              </div>
              <div className="roadmap-detail-tabs">
                <button
                  type="button"
                  aria-pressed={tab === "features"}
                  onClick={() => setTab("features")}
                >
                  <List size={14} />
                  Feature list <span>{filtered.length}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "dependencies"}
                  onClick={() => setTab("dependencies")}
                >
                  <GitBranch size={14} />
                  Dependencies <span>{plan.edges.length + plan.externalCount}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "stories"}
                  onClick={() => setTab("stories")}
                >
                  User stories <span>{storyFeature?.story_progress?.total ?? 0}</span>
                </button>
                <p>Story completion updates progress automatically.</p>
              </div>
              {tab === "features" ? (
                <div className="roadmap-table-scroll">
                  <RoadmapFeatureTable model={model} />
                </div>
              ) : tab === "dependencies" ? (
                <DependencyTable plan={plan} tasks={tasks} onSelect={setSelectedId} />
              ) : storyFeature ? (
                <RoadmapStories
                  key={storyFeature.id}
                  feature={storyFeature}
                  features={storyFeatures}
                  tasks={tasks}
                  canWrite={canWrite}
                  onSelect={setSelectedId}
                  onCreate={createStory}
                  onToggle={toggleStory}
                  onLink={() => setEditing(storyFeature)}
                />
              ) : (
                <p className="roadmap-empty">Add a feature to link user stories.</p>
              )}
            </div>
            <aside className="roadmap-insights" aria-label="Roadmap insights">
              <h3>Project insights</h3>
              <Insight
                icon={CalendarDays}
                label="Planned duration"
                value={plan.durationDays === null ? "Not scheduled" : `${plan.durationDays} days`}
              />
              <Insight
                icon={Timer}
                label="Critical path duration"
                value={plan.criticalDays === null ? "Not calculated" : `${plan.criticalDays} days`}
                critical
              />
              <Insight icon={Layers} label="Total features" value={String(plan.nodes.length)} />
              <Insight
                icon={GitBranch}
                label="Dependencies"
                value={String(plan.edges.length + plan.externalCount)}
              />
              <div className="roadmap-completion">
                <span>
                  <CheckCircle2 size={16} />
                  Completion<b>{completionPercent}%</b>
                </span>
                <div>
                  <i style={{ width: `${completionPercent}%` }} />
                </div>
                <small>
                  {plan.completed} of {plan.nodes.length} complete
                </small>
              </div>
              {selected && <RoadmapSelectedFeature model={model} />}
              <RoadmapCriticalPath model={model} />
            </aside>
          </div>
        </>
      )}
      {editing !== undefined && (
        <RoadmapFeatureDialog
          feature={editing}
          tasks={tasks}
          initialStartDate={newFeatureStart}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
    </section>
  );
}
