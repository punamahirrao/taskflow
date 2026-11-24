import { RoadmapStyles } from "../../Roadmap.styles";
import RoadmapWorkspace from "../../RoadmapWorkspace";

import type { useRoadmapPageModel } from "../../features/overview/useRoadmapPageModel";
import { RoadmapBreadcrumbs } from "./RoadmapBreadcrumbs";
import { RoadmapHeader } from "./RoadmapHeader";
import { RoadmapLoadError } from "./RoadmapLoadError";
import { RoadmapLoading } from "./RoadmapLoading";
import { RoadmapProjectEmpty } from "./RoadmapProjectEmpty";
export function RoadmapPageView({ model }: { model: ReturnType<typeof useRoadmapPageModel> }) {
  const { loading, error, project } = model;
  return (
    <main className="roadmap-page" data-testid="page-roadmap">
      <RoadmapStyles />
      <RoadmapHeader model={model} />
      <RoadmapBreadcrumbs />
      {error && <RoadmapLoadError model={model} />}
      {loading ? (
        <RoadmapLoading />
      ) : project ? (
        <RoadmapWorkspace key={project.id} project={project} />
      ) : (
        !error && <RoadmapProjectEmpty />
      )}
    </main>
  );
}
