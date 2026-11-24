export function OrganizationProjectsHeader({ count }: { count: number }) {
  return (
    <div className="project-section-heading">
      <h2 id="organization-projects-title">
        Other organization projects <span className="project-section-count">{count}</span>
      </h2>
    </div>
  );
}
