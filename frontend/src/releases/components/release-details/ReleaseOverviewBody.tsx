import { ArrowUpRight, CalendarDays, Target } from "lucide-react";
import { Link } from "react-router-dom";
import type { useReleaseDetailsModel } from "../../features/release-details/useReleaseDetailsModel";
import { formatDate } from "../../utils/releaseDisplay";

export function ReleaseOverviewBody({
  model,
}: {
  model: ReturnType<typeof useReleaseDetailsModel>;
}) {
  const { showTasks, setShowTasks, done, release } = model;
  return (
    <div className="release-detail-body">
      <p className="release-date">
        <CalendarDays size={17} />
        {formatDate(release.target_date)}
      </p>
      {release.description && <p className="whitespace-pre-wrap text-sm">{release.description}</p>}
      <div className="release-links">
        <h3>
          <Target size={17} /> Linked goals
        </h3>
        {release.goals.length ? (
          <ul>
            {release.goals.map((goal) => (
              <li key={goal.id}>
                <Link to={`/goals?goal=${goal.id}`}>
                  {goal.name}
                  <ArrowUpRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="release-muted">No goals linked.</p>
        )}
      </div>
      <div className="release-task-summary">
        <div>
          <h3>Work item progress</h3>
          <span>
            {done} of {release.tasks.length} complete
          </span>
        </div>
        <progress
          max={Math.max(release.tasks.length, 1)}
          value={done}
          aria-label="Linked work items complete"
        />
        {release.tasks.length > 0 && (
          <button
            type="button"
            aria-expanded={showTasks}
            className="release-link"
            onClick={() => setShowTasks(!showTasks)}
          >
            {showTasks ? "Hide linked work" : "Show linked work"}
          </button>
        )}
      </div>
      {showTasks && (
        <ul className="release-task-list">
          {release.tasks.map((task) => (
            <li key={task.id}>
              <Link to={`/project/${task.project_id}`}>
                {task.title}
                <small>{task.project_name}</small>
              </Link>
              <span className={`release-badge ${task.status === "done" ? "done" : "planned"}`}>
                {task.status.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
