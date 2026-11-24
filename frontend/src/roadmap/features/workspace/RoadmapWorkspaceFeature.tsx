import type { Project } from "../../../common/entities/project";
import { RoadmapWorkspaceView } from "../../components/workspace/RoadmapWorkspaceView";
import { useRoadmapWorkspaceModel } from "./useRoadmapWorkspaceModel";
export function RoadmapWorkspaceFeature({ project }: { project: Project }) {
  const model = useRoadmapWorkspaceModel({ project });
  return <RoadmapWorkspaceView model={model} />;
}
