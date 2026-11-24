import type { useRoadmapPageModel } from "../../features/overview/useRoadmapPageModel";
export function RoadmapLoadError({ model }: { model: ReturnType<typeof useRoadmapPageModel> }) {
  const { error } = model;
  return (
    <p className="roadmap-error" role="alert">
      {error}
    </p>
  );
}
