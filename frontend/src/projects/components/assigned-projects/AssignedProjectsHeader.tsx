export function AssignedProjectsHeader({ count }: { count: number }) {
  return (
    <div className="project-section-heading">
      <h2 id="assigned-projects-title">
        Assigned to you <span className="project-section-count">{count}</span>
      </h2>
    </div>
  );
}
