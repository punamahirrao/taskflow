import { ReportsPageView } from "../../components/overview/ReportsPageView";
import { useReportsPageModel } from "./useReportsPageModel";
export function ReportsPageFeature() {
  const model = useReportsPageModel();
  return <ReportsPageView model={model} />;
}
