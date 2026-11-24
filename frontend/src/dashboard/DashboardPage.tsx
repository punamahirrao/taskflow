import { ArrowRight, FolderKanban, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { dataScope } from "../common/api/queryApi";
import { DeliveryDashboardStyles } from "./DeliveryDashboard.styles";
import { useDeliveryQuery } from "./api/dashboardQueries";
import { ActiveSprints } from "./features/active-sprints/ActiveSprints";
import { ComingUp } from "./features/coming-up/ComingUp";
import { DeliveryFlow } from "./features/delivery-flow/DeliveryFlow";
import { DeliverySummary } from "./features/delivery-summary/DeliverySummary";
import { NeedsAttention } from "./features/needs-attention/NeedsAttention";
import { ProjectPulse } from "./features/project-pulse/ProjectPulse";
import { RecentActivity } from "./features/recent-activity/RecentActivity";
import { TaskSnapshot } from "./features/task-snapshot/TaskSnapshot";

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
          <TaskSnapshot snapshot={snapshot} />
          <div className="delivery-grid">
            <DeliveryFlow trend={snapshot.trend} />
            <NeedsAttention key={selectedId ?? "all"} snapshot={snapshot} />
          </div>
          <div className="delivery-grid">
            <div className="delivery-stack">
              <ProjectPulse
                projects={snapshot.projects}
                selectedId={selectedId}
                onSelect={select}
              />
              <RecentActivity key={selectedId ?? "all"} projectId={selectedId} />
            </div>
            <div className="delivery-stack">
              <ActiveSprints sprints={snapshot.sprints} sprintCount={snapshot.sprint_count} />
              <ComingUp milestones={snapshot.milestones} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
