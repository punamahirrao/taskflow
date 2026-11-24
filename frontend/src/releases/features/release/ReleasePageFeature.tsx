import { ReleasePageView } from "../../components/release/ReleasePageView";
import { useReleasePageModel } from "./useReleasePageModel";
export function ReleasePageFeature() {
  const model = useReleasePageModel();
  return <ReleasePageView model={model} />;
}
