import { useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarClock, Flag, History, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { dataScope } from "../../common/api/queryApi";
import { useActivityQuery } from "../api/dashboardQueries";
import type { AttentionKind, DeliveryProject, DeliverySnapshot } from "../entities/delivery";
import { percent, shortDate } from "../utils/deliveryFormat";

const ATTENTION_LIMIT = 4;
const PROJECT_LIMIT = 5;
const SCHEDULE_LIMIT = 3;
const ACTIVITY_LIMIT = 5;

function Progress({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div className="delivery-progress">
      <progress max={100} value={percent(done, total)} aria-label={label} />
      <small>
        {done}/{total} done
      </small>
    </div>
  );
}

const attentionFilters: { id: AttentionKind; label: string; empty: string }[] = [
  { id: "overdue", label: "Overdue", empty: "No open items are overdue." },
  {
    id: "blocked",
    label: "Blocked",
    empty: "No open items are marked blocked or waiting on an unfinished dependency you can see.",
  },
  {
    id: "due_soon",
    label: "Due in 7 days",
    empty: "No open work items are due in the next 7 days.",
  },
];

export function DeliveryAttention({ snapshot }: { snapshot: DeliverySnapshot }) {
  const initial = attentionFilters.find(({ id }) => snapshot.attention[id].length)?.id ?? "overdue";
  const [filter, setFilter] = useState<AttentionKind | null>(null);
  const [visibleCount, setVisibleCount] = useState(ATTENTION_LIMIT);
  const active = filter ?? initial;
  const items = snapshot.attention[active];
  const count = snapshot.projects.reduce((sum, project) => sum + project[active], 0);
  return (
    <section className="delivery-panel" aria-labelledby="delivery-attention-title">
      <div className="delivery-panel-heading">
        <div>
          <h2 id="delivery-attention-title">Needs attention</h2>
        </div>
        <CalendarClock className="delivery-heading-icon" size={21} />
      </div>
      <div className="delivery-filters" aria-label="Attention filters">
        {attentionFilters.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            aria-pressed={active === id}
            onClick={() => {
              setFilter(id);
              setVisibleCount(ATTENTION_LIMIT);
            }}
          >
            {label} <b>{snapshot.projects.reduce((sum, project) => sum + project[id], 0)}</b>
          </button>
        ))}
      </div>
      {items.length ? (
        <ul className="delivery-list" id="delivery-attention-list">
          {items.slice(0, visibleCount).map((item) => (
            <li key={item.id}>
              <span className={`delivery-dot ${active}`} aria-hidden="true" />
              <div>
                <strong>{item.title}</strong>
                <small>
                  {item.project_name} · {item.assignee ?? "Unassigned"}
                </small>
              </div>
              <div className="delivery-list-meta">
                <span>{item.due_date ? shortDate(item.due_date) : "No due date"}</span>
                <small>{item.priority} priority</small>
              </div>
              <Link
                className="delivery-open"
                to={`/project/${item.project_id}`}
                aria-label={`Open project ${item.project_name} for ${item.title}`}
              >
                <ArrowUpRight size={16} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="delivery-empty">{attentionFilters.find(({ id }) => id === active)?.empty}</p>
      )}
      {count > ATTENTION_LIMIT && (
        <div className="delivery-panel-footer">
          <span>
            Showing {Math.min(visibleCount, items.length)} of {count}
          </span>
          {visibleCount < items.length ? (
            <button
              className="delivery-link"
              type="button"
              aria-controls="delivery-attention-list"
              aria-label="More attention items"
              onClick={() => setVisibleCount(visibleCount + ATTENTION_LIMIT)}
            >
              More <ArrowRight size={15} />
            </button>
          ) : count > items.length ? (
            <Link
              className="delivery-link"
              to={
                snapshot.projects.length === 1 ? `/project/${snapshot.projects[0].id}` : "/projects"
              }
            >
              View project work <ArrowUpRight size={15} />
            </Link>
          ) : (
            <button
              className="delivery-link"
              type="button"
              aria-controls="delivery-attention-list"
              onClick={() => setVisibleCount(ATTENTION_LIMIT)}
            >
              Show less
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function health(project: DeliveryProject) {
  if (project.status === "archived") return { label: "Archived", tone: "neutral" };
  if (project.at_risk) return { label: "Needs attention", tone: "risk" };
  if (!project.total) return { label: "No work yet", tone: "neutral" };
  if (project.total === project.done) return { label: "All work done", tone: "good" };
  if (project.due_soon) return { label: "Due soon", tone: "watch" };
  return { label: "No open risks", tone: "good" };
}

export function DeliveryProjects({
  projects,
  selectedId,
  onSelect,
}: {
  projects: DeliveryProject[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const sorted = [...projects].sort(
    (a, b) => b.at_risk - a.at_risk || a.name.localeCompare(b.name),
  );
  return (
    <section className="delivery-panel" aria-labelledby="delivery-projects-title">
      <div className="delivery-panel-heading">
        <div>
          <h2 id="delivery-projects-title">Project pulse</h2>
        </div>
        <Link className="delivery-link" to="/projects">
          Project directory <ArrowUpRight size={15} />
        </Link>
      </div>
      <div
        className="delivery-table-scroll"
        role="region"
        aria-label="Project pulse table"
        tabIndex={0}
      >
        <table className="delivery-table">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Health</th>
              <th scope="col">Progress</th>
              <th scope="col">Target</th>
              <th scope="col">
                <span className="sr-only">Open project</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, PROJECT_LIMIT).map((project) => {
              const signal = health(project);
              return (
                <tr key={project.id}>
                  <th scope="row">
                    {selectedId === project.id ? (
                      project.name
                    ) : (
                      <button
                        type="button"
                        className="delivery-link"
                        onClick={() => onSelect(project.id)}
                      >
                        {project.name}
                      </button>
                    )}
                  </th>
                  <td>
                    <span className={`delivery-health ${signal.tone}`}>{signal.label}</span>
                    {project.at_risk > 0 && (
                      <small className="delivery-risk-count">{project.at_risk} flagged</small>
                    )}
                  </td>
                  <td>
                    <Progress
                      done={project.done}
                      total={project.total}
                      label={`${project.name} completion`}
                    />
                  </td>
                  <td>{project.end_date ? shortDate(project.end_date) : "Unscheduled"}</td>
                  <td>
                    <Link
                      className="delivery-open"
                      to={`/project/${project.id}`}
                      aria-label={`Open ${project.name}`}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {projects.length > PROJECT_LIMIT && (
        <div className="delivery-panel-footer">
          <span>
            Showing {PROJECT_LIMIT} of {projects.length}
          </span>
          <Link className="delivery-link" to="/projects" aria-label="More projects">
            More <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <p className="delivery-panel-note">
        Health flags open overdue or blocked work. Due soon covers today and the next six days.
      </p>
    </section>
  );
}

const planPaths = { release: "/releases", goal: "/goals", milestone: "/planning/milestones" };

export function DeliverySchedule({ snapshot }: { snapshot: DeliverySnapshot }) {
  return (
    <div className="delivery-stack">
      <section className="delivery-panel" aria-labelledby="delivery-sprints-title">
        <div className="delivery-panel-heading">
          <div>
            <h2 id="delivery-sprints-title">
              Active sprints <span>{snapshot.sprint_count}</span>
            </h2>
          </div>
          <Link className="delivery-link" to="/sprint-train">
            Sprint Train <ArrowUpRight size={15} />
          </Link>
        </div>
        {snapshot.sprints.length ? (
          <ul className="delivery-list delivery-sprints">
            {snapshot.sprints.slice(0, SCHEDULE_LIMIT).map((sprint) => (
              <li key={sprint.id}>
                <Layers3 size={17} className="delivery-heading-icon" />
                <div>
                  <strong>{sprint.name}</strong>
                  <small>
                    {sprint.project__name}
                    {sprint.end_date ? ` · Ends ${shortDate(sprint.end_date)}` : ""}
                  </small>
                  {sprint.goal && <p>{sprint.goal}</p>}
                  <Progress
                    done={sprint.done}
                    total={sprint.total}
                    label={`${sprint.name} completion`}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="delivery-empty">No active sprints in this view.</p>
        )}
        {snapshot.sprint_count > SCHEDULE_LIMIT && (
          <div className="delivery-panel-footer">
            <span>
              Showing {Math.min(SCHEDULE_LIMIT, snapshot.sprints.length)} of {snapshot.sprint_count}
            </span>
            <Link className="delivery-link" to="/sprint-train" aria-label="More active sprints">
              More <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
      <section className="delivery-panel" aria-labelledby="delivery-milestones-title">
        <div className="delivery-panel-heading">
          <div>
            <h2 id="delivery-milestones-title">Coming up</h2>
          </div>
          <Flag size={20} className="delivery-heading-icon" />
        </div>
        {snapshot.milestones.length ? (
          <ul className="delivery-list">
            {snapshot.milestones.slice(0, SCHEDULE_LIMIT).map((item) => (
              <li key={item.id}>
                <div>
                  <Link className="delivery-link" to={planPaths[item.kind]}>
                    {item.name}
                  </Link>
                  <small className="capitalize">{item.kind}</small>
                </div>
                <time dateTime={item.target_date} className="delivery-list-meta">
                  {shortDate(item.target_date)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="delivery-empty">
            No linked milestones, releases, or goals are due in this period.
          </p>
        )}
        {snapshot.milestones.length > SCHEDULE_LIMIT && (
          <div className="delivery-panel-footer">
            <Link className="delivery-link" to="/calendar" aria-label="More upcoming targets">
              More <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function DeliveryActivity({ projectId }: { projectId: number | null }) {
  const {
    currentData: activity,
    error,
    isFetching,
    refetch,
  } = useActivityQuery({ ...dataScope(projectId), currentProjects: projectId === null });
  const [visibleCount, setVisibleCount] = useState(ACTIVITY_LIMIT);
  return (
    <section className="delivery-panel" aria-labelledby="delivery-activity-title">
      <div className="delivery-panel-heading">
        <div>
          <h2 id="delivery-activity-title">Recent activity</h2>
          <p>Changes recorded on project work items</p>
        </div>
      </div>
      {error ? (
        <p className="delivery-empty" role="alert">
          Could not load activity.{" "}
          <button className="delivery-link" type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </p>
      ) : activity?.length ? (
        <ul className="delivery-list delivery-activity-list" id="delivery-activity-list">
          {activity.slice(0, visibleCount).map((item) => (
            <li key={item.id}>
              <span className="delivery-activity-icon">
                <History size={16} />
              </span>
              <div>
                <strong>{item.actor}</strong> {item.action.replaceAll("_", " ")}{" "}
                <Link className="delivery-link" to={`/project/${item.project_id}`}>
                  {item.title}
                </Link>
                <small>{item.project_name}</small>
              </div>
              <time className="delivery-list-meta" dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="delivery-empty" role={isFetching ? "status" : undefined}>
          {isFetching ? "Loading activity…" : "No work item activity has been recorded."}
        </p>
      )}
      {!error && activity && activity.length > ACTIVITY_LIMIT && (
        <div className="delivery-panel-footer">
          <span>
            Showing {Math.min(visibleCount, activity.length)} of {activity.length}
          </span>
          <button
            className="delivery-link"
            type="button"
            aria-controls="delivery-activity-list"
            aria-label={
              visibleCount < activity.length ? "More recent activity" : "Show less recent activity"
            }
            onClick={() =>
              setVisibleCount(
                visibleCount < activity.length ? visibleCount + ACTIVITY_LIMIT : ACTIVITY_LIMIT,
              )
            }
          >
            {visibleCount < activity.length ? (
              <>
                More <ArrowRight size={15} />
              </>
            ) : (
              "Show less"
            )}
          </button>
        </div>
      )}
    </section>
  );
}
