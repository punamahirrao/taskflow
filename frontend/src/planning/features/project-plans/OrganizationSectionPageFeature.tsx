import { OrganizationSectionPageView } from "../../components/project-plans/OrganizationSectionPageView";
import { useOrganizationSectionPageModel } from "./useOrganizationSectionPageModel";
export function OrganizationSectionPageFeature() {
  const model = useOrganizationSectionPageModel();
  return <OrganizationSectionPageView model={model} />;
}
