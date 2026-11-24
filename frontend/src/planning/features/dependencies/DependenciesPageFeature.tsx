import { DependenciesPageView } from "../../components/dependencies/DependenciesPageView";
import { useDependenciesPageModel } from "./useDependenciesPageModel";
export function DependenciesPageFeature() {
  const model = useDependenciesPageModel();
  return <DependenciesPageView model={model} />;
}
