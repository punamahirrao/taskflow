import type { Project } from "../common/entities/project";
import { RoadmapWorkspaceFeature } from "./features/workspace/RoadmapWorkspaceFeature";
export default function RoadmapWorkspace({ project }: { project: Project }) {
  return <RoadmapWorkspaceFeature {...{ project }} />;
}
