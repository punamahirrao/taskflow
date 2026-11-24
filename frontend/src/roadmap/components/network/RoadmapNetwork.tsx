import { Focus, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  shortDate,
  weekLabel,
  type RoadmapPlan,
} from "../../utils/roadmapModel";
import { contrastText, featureColor } from "../../utils/timelineModel";

interface Props {
  plan: RoadmapPlan;
  selectedId: number | null;
  onSelect: (id: number) => void;
  showCritical: boolean;
}
export default function RoadmapNetwork({ plan, selectedId, onSelect, showCritical }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (!viewport.current) return;
    let previousWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
      if (Math.abs(width - previousWidth) < 1) return;
      previousWidth = width;
      setZoom(Math.min(1, Math.max(0.55, (width - 24) / plan.width)));
    });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [plan.width]);
  function fit() {
    if (viewport.current)
      setZoom(Math.min(1.4, Math.max(0.25, (viewport.current.clientWidth - 24) / plan.width)));
  }
  const byId = new Map(plan.nodes.map((node) => [node.task.id, node]));
  const middle = plan.height / 2;
  const startX = 54,
    endX = plan.width - 54;
  return (
    <section className="roadmap-network" aria-label="Feature dependency map">
      <div className="roadmap-map-toolbar">
        <span>
          <button
            type="button"
            aria-label="Zoom out dependency map"
            onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
          >
            <Minus size={15} />
          </button>
          <output aria-label="Map zoom">{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label="Zoom in dependency map"
            onClick={() => setZoom(Math.min(1.6, zoom + 0.1))}
          >
            <Plus size={15} />
          </button>
        </span>
        <button type="button" onClick={fit}>
          <Focus size={14} />
          Fit view
        </button>
        <small>Choose a feature to see its delivery details</small>
      </div>
      <div ref={viewport} className="roadmap-map-viewport">
        <div
          className="roadmap-scaled-world"
          style={{ width: plan.width * zoom, height: plan.height * zoom }}
        >
          <div
            className="roadmap-map-world"
            style={{ width: plan.width, height: plan.height, transform: `scale(${zoom})` }}
          >
            <svg
              width={plan.width}
              height={plan.height}
              aria-label="Dependency connections"
              role="img"
              className="roadmap-connectors"
            >
              <defs>
                {["normal", "critical", "conflict"].map((kind) => (
                  <marker
                    key={kind}
                    id={`roadmap-arrow-${kind}`}
                    markerWidth="7"
                    markerHeight="7"
                    refX="6"
                    refY="3.5"
                    orient="auto"
                  >
                    <path d="M0,0 L7,3.5 L0,7" className={`roadmap-arrow ${kind}`} />
                  </marker>
                ))}
              </defs>
              {plan.edges.map((edge) => {
                const from = byId.get(edge.from)!,
                  to = byId.get(edge.to)!;
                const x1 = from.x + NODE_WIDTH,
                  y1 = from.y + NODE_HEIGHT / 2,
                  x2 = to.x - 3,
                  y2 = to.y + NODE_HEIGHT / 2;
                const kind = edge.conflict
                  ? "conflict"
                  : showCritical && edge.critical
                    ? "critical"
                    : "normal";
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    className={`roadmap-edge ${kind}`}
                    markerEnd={`url(#roadmap-arrow-${kind})`}
                    d={`M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}`}
                  >
                    <title>
                      #{edge.from} → #{edge.to}
                      {edge.conflict ? " · delivery overlaps the successor’s planned start" : ""}
                    </title>
                  </path>
                );
              })}
              {plan.nodes
                .filter((node) => !node.predecessors.length)
                .map((node) => (
                  <path
                    key={`start-${node.task.id}`}
                    className="roadmap-edge normal"
                    markerEnd="url(#roadmap-arrow-normal)"
                    d={`M ${startX + 30} ${middle} C 110 ${middle}, 105 ${node.y + NODE_HEIGHT / 2}, ${node.x - 3} ${node.y + NODE_HEIGHT / 2}`}
                  />
                ))}
              {plan.nodes
                .filter((node) => !node.successors.length)
                .map((node) => (
                  <path
                    key={`end-${node.task.id}`}
                    className="roadmap-edge normal"
                    markerEnd="url(#roadmap-arrow-normal)"
                    d={`M ${node.x + NODE_WIDTH} ${node.y + NODE_HEIGHT / 2} C ${endX - 65} ${node.y + NODE_HEIGHT / 2}, ${endX - 60} ${middle}, ${endX - 33} ${middle}`}
                  />
                ))}
            </svg>
            <div className="roadmap-boundary" style={{ left: startX - 30, top: middle - 30 }}>
              <b>Start</b>
              <small>{shortDate(plan.startDate)}</small>
            </div>
            {plan.nodes.map((node) => {
              const color = featureColor(node.task),
                percent = node.task.story_progress?.percent ?? 0;
              return (
                <button
                  key={node.task.id}
                  type="button"
                  title={node.task.title}
                  onClick={() => onSelect(node.task.id)}
                  aria-pressed={selectedId === node.task.id}
                  className={`roadmap-feature-node custom-color ${showCritical && node.critical ? "critical" : ""} ${selectedId === node.task.id ? "selected" : ""}`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    borderColor: color,
                    background: `linear-gradient(to right, color-mix(in srgb, ${color} ${percent === 100 ? "100%" : "35%"}, var(--theme-surface)) ${percent}%, color-mix(in srgb, ${color} 9%, var(--theme-surface)) ${percent}%)`,
                    color: percent === 100 ? contrastText(color) : "var(--theme-text)",
                  }}
                >
                  <span className="roadmap-node-id">
                    #{node.task.id}
                    <span>{node.duration === null ? "Unscheduled" : `${node.duration}d`}</span>
                  </span>
                  <b>{node.task.title}</b>
                  <small>
                    {weekLabel(node.task.due_date)} · {percent}%
                  </small>
                  <span className="roadmap-node-dates">
                    {shortDate(node.task.planned_start_date)} → {shortDate(node.task.due_date)}
                  </span>
                </button>
              );
            })}
            <div className="roadmap-boundary" style={{ left: endX - 30, top: middle - 30 }}>
              <b>Delivery</b>
              <small>{shortDate(plan.endDate)}</small>
            </div>
          </div>
        </div>
      </div>
      <div className="roadmap-legend">
        <span>
          <i className="feature" />
          Feature
        </span>
        <span>
          <i className="critical" />
          Critical feature
        </span>
        <span>
          <i className="complete" />
          Complete
        </span>
        <span>
          <i className="milestone" />
          Plan boundary
        </span>
        <span>
          <i className="line" />
          Dependency
        </span>
        <span>
          <i className="warning" />
          Schedule overlap
        </span>
      </div>
    </section>
  );
}
