import { RoadmapPageView } from "../../components/overview/RoadmapPageView";
import { useRoadmapPageModel } from "./useRoadmapPageModel";
export function RoadmapPageFeature() {
  const model = useRoadmapPageModel();
  return <RoadmapPageView model={model} />;
}
