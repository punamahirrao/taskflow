import { DeliveryDashboardStyles } from "./DeliveryDashboard.styles";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  FolderKanban,
  GitPullRequest,
  Layers3,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { dataScope } from "../common/api/queryApi";
import { useDeliveryQuery } from "./api/dashboardQueries";
import { DeliveryTrend } from "./components/DeliveryTrend";
import {
  DeliveryActivity,
  DeliveryAttention,
  DeliveryProjects,
  DeliverySchedule,
} from "./components/DeliveryPanels";
import type { DeliverySnapshot } from "./entities/delivery";
import { percent } from "./utils/deliveryFormat";

function DeliverySummary({
  snapshot,
  selectedName,
}: {
  snapshot: DeliverySnapshot;
  selectedName?: string;
}) {
  const total = snapshot.projects.reduce((sum, project) => sum + project.total, 0);
  const done = snapshot.projects.reduce((sum, project) => sum + project.done, 0);
  const risk = snapshot.projects.reduce((sum, project) => sum + project.at_risk, 0);
  const review = snapshot.projects.reduce((sum, project) => sum + project.in_review, 0);
  const count = snapshot.projects.filter((project) => project.at_risk > 0).length;
  const completion = percent(done, total);
  let headline = "No open risks flagged";
  let description = `${total - done} open work items across ${snapshot.projects.length} ${snapshot.projects.length === 1 ? "project" : "projects"}.`;
  if (risk) {
    headline = "Delivery needs attention";
    description = `${risk} open ${risk === 1 ? "item is" : "items are"} overdue or blocked${selectedName ? "" : ` across ${count} ${count === 1 ? "project" : "projects"}`}.`;
  } else if (!total) {
    headline = "Ready to plan delivery";
    description = "Add work items to start tracking progress and deadlines.";
  } else if (done === total) {
    headline = "All tracked work is complete";
    description = `${done} ${done === 1 ? "work item is" : "work items are"} marked done.`;
  }

  const stats = [
    {
      title: "Open work",
      value: total - done,
      Icon: Layers3,
      color: "violet",
    },
    {
      title: "Completed",
      value: done,
      Icon: CircleCheck,
      color: "teal",
    },
    {
      title: "In review",
      value: review,
      Icon: GitPullRequest,
      color: "blue",
    },
    {
      title: "Active sprints",
      value: snapshot.sprint_count,
      Icon: CalendarClock,
      color: "amber",
    },
  ];

  return (
    <>
      <section className="delivery-hero" aria-labelledby="delivery-hero-title">
        <div className="delivery-hero-copy">
          <span className="delivery-hero-label">{selectedName ?? "Organization overview"}</span>
          <h2 id="delivery-hero-title">{headline}</h2>
          <p>{description}</p>
          <a href="#delivery-attention-title" className="delivery-hero-link">
            Review work queue <ArrowRight size={17} />
          </a>
        </div>
        <div
          className="delivery-hero-ring"
          style={{ background: `conic-gradient(#9cebcb ${completion}%, #454e75 ${completion}%)` }}
        >
          <div>
            <strong>{completion}%</strong>
            <span>complete</span>
          </div>
        </div>
      </section>
      <div className="delivery-metrics">
        {stats.map(({ title, value, Icon, color }) => (
          <div className="delivery-metric" key={title}>
            <span className={`delivery-metric-icon ${color}`}>
              <Icon size={21} />
            </span>
            <div>
              <h3>{title}</h3>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { projects, loading, error: projectsError, selectedId, select } = useProjectContext();
  const selected = projects.find((project) => project.id === selectedId);
  const {
    currentData: snapshot,
    isFetching,
    error,
    refetch,
  } = useDeliveryQuery(dataScope(selectedId ?? null), { skip: loading });

  return (
    <main className="delivery-dashboard" data-testid="page-dashboard">
      <DeliveryDashboardStyles />
      <header className="delivery-header">
        <h1>Dashboard</h1>
      </header>
      {(error || projectsError) && (
        <div className="delivery-alert" role="alert">
          <TriangleAlert size={18} />
          <span>{projectsError || "Could not refresh project health."}</span>
          <button className="delivery-link" type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      )}
      {(loading || (!snapshot && isFetching)) && (
        <p className="delivery-empty" role="status">
          Loading project health…
        </p>
      )}
      {snapshot && !snapshot.projects.length && (
        <div className="delivery-panel delivery-no-projects">
          <FolderKanban size={30} className="delivery-heading-icon" />
          <h2>No projects in this view</h2>
          <p>Create or join a project to track its delivery here.</p>
          <Link className="delivery-link" to="/projects">
            Browse projects <ArrowRight size={17} />
          </Link>
        </div>
      )}
      {snapshot && snapshot.projects.length > 0 && (
        <div className="delivery-content">
          {isFetching && (
            <span className="sr-only" role="status">
              Refreshing dashboard…
            </span>
          )}
          <DeliverySummary snapshot={snapshot} selectedName={selected?.name} />
          <div className="delivery-grid">
            <DeliveryTrend trend={snapshot.trend} />
            <DeliveryAttention key={selectedId ?? "all"} snapshot={snapshot} />
          </div>
          <div className="delivery-grid">
            <div className="delivery-stack">
              <DeliveryProjects
                projects={snapshot.projects}
                selectedId={selectedId}
                onSelect={select}
              />
              <DeliveryActivity key={selectedId ?? "all"} projectId={selectedId} />
            </div>
            <DeliverySchedule snapshot={snapshot} />
          </div>
        </div>
      )}
    </main>
  );
}
