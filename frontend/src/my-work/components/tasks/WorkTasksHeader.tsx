import { WorkTaskCreateButton } from "./WorkTaskCreateButton";
export function WorkTasksHeader({
  openCount,
  overview,
  canCreate,
  needsProject,
  onCreate,
  onView,
}: {
  openCount: number;
  overview: boolean;
  canCreate: boolean;
  needsProject: boolean;
  onCreate: () => void;
  onView: () => void;
}) {
  return (
    <header className="my-work-panel-heading">
      <h2>
        My Tasks <span>({openCount} open)</span>
      </h2>
      <div className="my-work-actions">
        {overview && (
          <button type="button" className="my-work-link" onClick={onView}>
            View all →
          </button>
        )}
        <WorkTaskCreateButton
          disabled={!canCreate}
          needsProject={needsProject}
          onCreate={onCreate}
        />
      </div>
    </header>
  );
}
