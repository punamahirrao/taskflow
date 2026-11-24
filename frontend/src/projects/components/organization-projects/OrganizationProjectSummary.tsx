export function OrganizationProjectSummary({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  return (
    <>
      <h3>{name}</h3>
      <p className="organization-project-description">
        {description || "No description provided."}
      </p>
    </>
  );
}
