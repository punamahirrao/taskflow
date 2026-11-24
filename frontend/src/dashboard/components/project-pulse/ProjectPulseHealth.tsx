import type { DeliveryProject } from "../../entities/delivery";

function health(project: DeliveryProject) {
  if (project.status === "archived") return { label: "Archived", tone: "neutral" };
  if (project.at_risk) return { label: "Needs attention", tone: "risk" };
  if (!project.total) return { label: "No work yet", tone: "neutral" };
  if (project.total === project.done) return { label: "All work done", tone: "good" };
  if (project.due_soon) return { label: "Due soon", tone: "watch" };
  return { label: "No open risks", tone: "good" };
}

export function ProjectPulseHealth({ project }: { project: DeliveryProject }) {
  const signal = health(project);
  return (
    <>
      <span className={`delivery-health ${signal.tone}`}>{signal.label}</span>
      {project.at_risk > 0 && (
        <small className="delivery-risk-count">{project.at_risk} flagged</small>
      )}
    </>
  );
}
