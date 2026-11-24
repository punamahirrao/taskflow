import { Link } from "react-router-dom";
import { PaddedPage } from "../../../common/components/styled";
import type { useOrganizationSectionPageModel } from "../../features/project-plans/useOrganizationSectionPageModel";
import { ProjectPlansContent } from "./ProjectPlansContent";

export function OrganizationSectionPageView({
  model,
}: {
  model: ReturnType<typeof useOrganizationSectionPageModel>;
}) {
  if (model.missing)
    return (
      <main className="p-8">
        <h1>Page not found</h1>
        <Link to="/dashboard">Return to dashboard</Link>
      </main>
    );
  return (
    <PaddedPage>
      <ProjectPlansContent model={model} />
    </PaddedPage>
  );
}
