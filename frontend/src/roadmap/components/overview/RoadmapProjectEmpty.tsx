import { Map as MapIcon } from "lucide-react";

export function RoadmapProjectEmpty() {
  return (
    <section className="roadmap-empty">
      <MapIcon size={32} />
      <h2>Select a project to view its roadmap</h2>
      <p>Choose a project from the selector to plan its features and delivery weeks.</p>
    </section>
  );
}
