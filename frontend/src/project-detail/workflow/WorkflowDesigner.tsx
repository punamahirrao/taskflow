import { useEffect, useState, type FormEvent, type PointerEvent } from "react";
import { ArrowRight, Check, Circle, GitBranch, Grip, Plus, Save, Trash2 } from "lucide-react";
import { getProjectWorkflow, saveProjectWorkflow } from "./api";
import type { WorkflowGraph, WorkflowKind, WorkflowNode } from "./types";
import "./workflow.css";

const blank = (kind: WorkflowKind): WorkflowGraph => ({
  kind,
  nodes: [],
  edges: [],
  start_key: "",
  end_key: "",
  enabled: false,
  configured: false,
  revision: 0,
  can_manage: false,
});
const snapshot = (graph: WorkflowGraph) =>
  JSON.stringify({
    nodes: graph.nodes,
    edges: graph.edges,
    start_key: graph.start_key,
    end_key: graph.end_key,
    enabled: graph.enabled,
  });
const RELEASE_TRANSITIONS = new Set([
  "planned->in_progress",
  "in_progress->ready",
  "ready->done",
  "in_progress->changes_requested",
  "changes_requested->in_progress",
]);

export default function WorkflowDesigner({ projectId }: { projectId: number }) {
  const [kind, setKind] = useState<WorkflowKind>("story");
  const [graphs, setGraphs] = useState<Record<WorkflowKind, WorkflowGraph>>({
    story: blank("story"),
    release: blank("release"),
  });
  const [loaded, setLoaded] = useState<Record<WorkflowKind, boolean>>({
    story: false,
    release: false,
  });
  // Snapshot the persisted server version separately so unsaved edits cannot change conflict checks.
  const [snapshots, setSnapshots] = useState<Record<WorkflowKind, string>>({
    story: "",
    release: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [connectFrom, setConnectFrom] = useState("");
  const [newStage, setNewStage] = useState("");
  const graph = graphs[kind];

  useEffect(() => {
    let active = true;
    for (const type of ["story", "release"] as const) {
      void getProjectWorkflow(projectId, type)
        .then((result) => {
          if (!active) return;
          setGraphs((current) => ({ ...current, [type]: result }));
          setSnapshots((current) => ({ ...current, [type]: snapshot(result) }));
          setLoaded((current) => ({ ...current, [type]: true }));
        })
        .catch((cause: unknown) => {
          if (!active) return;
          setLoaded((current) => ({ ...current, [type]: true }));
          setError(cause instanceof Error ? cause.message : "Could not load workflow.");
        });
    }
    return () => {
      active = false;
    };
  }, [projectId]);

  const update = (change: (current: WorkflowGraph) => WorkflowGraph) =>
    setGraphs((current) => ({ ...current, [kind]: change(current[kind]) }));
  const content = snapshot(graph);
  const isDirty = loaded[kind] && content !== snapshots[kind];

  function moveNode(event: PointerEvent<HTMLButtonElement>, node: WorkflowNode) {
    const canvas = event.currentTarget.closest(".workflow-canvas") as HTMLElement | null;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(12, Math.min(1120, event.clientX - rect.left - 106));
    const y = Math.max(12, Math.min(480, event.clientY - rect.top - 35));
    update((current) => ({
      ...current,
      nodes: current.nodes.map((item) =>
        item.key === node.key
          ? { ...item, x: Math.round(x / 10) * 10, y: Math.round(y / 10) * 10 }
          : item,
      ),
    }));
  }

  function addStage(event: FormEvent) {
    event.preventDefault();
    const label = newStage.trim();
    if (!label) return;
    const key = `stage_${Date.now().toString(36)}`;
    update((current) => {
      const node = {
        key,
        label,
        x: 90 + (current.nodes.length % 4) * 240,
        y: 90 + Math.floor(current.nodes.length / 4) * 140,
      };
      const previous = current.nodes.at(-1);
      return {
        ...current,
        nodes: [...current.nodes, { ...node, editable: true }],
        edges: previous ? [...current.edges, { source: previous.key, target: key }] : current.edges,
        start_key: current.start_key || key,
        end_key: key,
      };
    });
    setSelected(key);
    setNewStage("");
    setMessage("");
  }

  function connect(target: string) {
    if (
      !connectFrom ||
      target === connectFrom ||
      graph.edges.some((edge) => edge.source === connectFrom && edge.target === target)
    )
      return;
    if (kind === "release" && !RELEASE_TRANSITIONS.has(`${connectFrom}->${target}`)) return;
    update((current) => ({
      ...current,
      edges: [...current.edges, { source: connectFrom, target }],
    }));
    setConnectFrom("");
    setMessage("");
  }

  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await saveProjectWorkflow(projectId, { ...graph, enabled: true });
      setGraphs((current) => ({ ...current, [kind]: result }));
      setSnapshots((current) => ({ ...current, [kind]: snapshot(result) }));
      setMessage("Workflow saved and transition rules are active.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save workflow.");
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    setError("");
    try {
      const result = await getProjectWorkflow(projectId, kind);
      setGraphs((current) => ({ ...current, [kind]: result }));
      setSnapshots((current) => ({ ...current, [kind]: snapshot(result) }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reload workflow.");
    }
  }

  if (!loaded[kind]) return <p role="status">Loading workflow…</p>;
  const canManage = graph.can_manage;
  return (
    <section className="workflow-designer" aria-label="Configure workflow">
      <header className="workflow-header">
        <div>
          <h3>Configure workflow</h3>
          <p>Arrange stages and connect the transitions people can take.</p>
        </div>
        {canManage && (
          <button className="workflow-save" onClick={() => void save()} disabled={busy || !isDirty}>
            <Save size={16} />
            {busy ? "Saving…" : "Save workflow"}
          </button>
        )}
      </header>
      <div className="workflow-tabs" aria-label="Workflow type">
        {(
          [
            ["story", "Stories & tasks"],
            ["release", "Releases"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={kind === value}
            onClick={() => {
              setKind(value);
              setSelected("");
              setConnectFrom("");
              setError("");
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div className="workflow-alert" role="alert">
          {error}{" "}
          {error.includes("elsewhere") && (
            <button onClick={() => void reload()}>Reload latest</button>
          )}
        </div>
      )}
      {message && (
        <p className="workflow-success" role="status">
          {message}
        </p>
      )}
      {kind === "release" && (
        <p className="workflow-note">
          Release approval assignments and decisions remain required; this diagram controls the
          allowed release state changes.
        </p>
      )}
      <div className="workflow-toolbar">
        <span>
          <Circle size={13} /> Start <ArrowRight size={15} /> Finish
        </span>
        <span>
          {connectFrom
            ? `Choose the next stage after ${graph.nodes.find((node) => node.key === connectFrom)?.label}`
            : "Select Connect on a stage, then choose its destination."}
        </span>
      </div>
      <div className="workflow-canvas" aria-label="Workflow diagram">
        <svg className="workflow-edges" viewBox="0 0 1280 560" aria-hidden="true">
          <defs>
            <marker
              id="workflow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0 0L8 4L0 8Z" />
            </marker>
          </defs>
          {graph.edges.map((edge) => {
            const from = graph.nodes.find((node) => node.key === edge.source);
            const to = graph.nodes.find((node) => node.key === edge.target);
            if (!from || !to) return null;
            return (
              <path
                key={`${edge.source}-${edge.target}`}
                d={`M ${from.x + 205} ${from.y + 38} C ${from.x + 250} ${from.y + 38}, ${to.x - 45} ${to.y + 38}, ${to.x} ${to.y + 38}`}
                markerEnd="url(#workflow-arrow)"
              />
            );
          })}
        </svg>
        {graph.nodes.map((node) => (
          <article
            key={node.key}
            className={`workflow-node ${graph.start_key === node.key ? "is-start" : ""} ${graph.end_key === node.key ? "is-end" : ""} ${selected === node.key ? "is-selected" : ""}`}
            style={{ left: node.x, top: node.y }}
          >
            <button
              className="workflow-grip"
              title={`Move ${node.label}`}
              aria-label={`Move ${node.label}`}
              onKeyDown={(event) => {
                const delta = event.shiftKey ? 40 : 10;
                const offset = {
                  ArrowLeft: [-delta, 0],
                  ArrowRight: [delta, 0],
                  ArrowUp: [0, -delta],
                  ArrowDown: [0, delta],
                }[event.key];
                if (offset && canManage) {
                  event.preventDefault();
                  update((current) => ({
                    ...current,
                    nodes: current.nodes.map((item) =>
                      item.key === node.key
                        ? {
                            ...item,
                            x: Math.max(0, Math.min(1120, item.x + offset[0])),
                            y: Math.max(0, Math.min(480, item.y + offset[1])),
                          }
                        : item,
                    ),
                  }));
                }
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 1 && canManage) moveNode(event, node);
              }}
            >
              <Grip size={15} />
            </button>
            {canManage && kind === "story" && node.editable ? (
              <input
                className="workflow-node-name"
                aria-label={`Stage name for ${node.label}`}
                maxLength={80}
                value={node.label}
                onChange={(event) =>
                  update((current) => ({
                    ...current,
                    nodes: current.nodes.map((item) =>
                      item.key === node.key ? { ...item, label: event.target.value } : item,
                    ),
                  }))
                }
              />
            ) : (
              <strong>{node.label}</strong>
            )}
            <small>
              {graph.start_key === node.key
                ? "Start"
                : graph.end_key === node.key
                  ? "Finish"
                  : "Stage"}
            </small>
            {canManage && (
              <div className="workflow-node-actions">
                <button
                  onClick={() => {
                    setConnectFrom(connectFrom === node.key ? "" : node.key);
                    setSelected(node.key);
                  }}
                >
                  <GitBranch size={14} />
                  Connect
                </button>
                {connectFrom &&
                  connectFrom !== node.key &&
                  (kind === "story" || RELEASE_TRANSITIONS.has(`${connectFrom}->${node.key}`)) && (
                    <button onClick={() => connect(node.key)}>
                      <Check size={14} />
                      Link here
                    </button>
                  )}
                {kind === "story" && node.key !== graph.start_key && (
                  <button
                    onClick={() => update((current) => ({ ...current, start_key: node.key }))}
                  >
                    Set start
                  </button>
                )}
                {kind === "story" && node.key !== graph.end_key && (
                  <button onClick={() => update((current) => ({ ...current, end_key: node.key }))}>
                    Set finish
                  </button>
                )}
                {kind === "story" && node.key !== graph.start_key && node.key !== graph.end_key && (
                  <button
                    aria-label={`Remove ${node.label}`}
                    onClick={() =>
                      update((current) => ({
                        ...current,
                        nodes: current.nodes.filter((item) => item.key !== node.key),
                        edges: current.edges.filter(
                          (edge) => edge.source !== node.key && edge.target !== node.key,
                        ),
                      }))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      {canManage && (
        <ul className="workflow-transition-list" aria-label="Workflow transitions">
          {graph.edges.map((edge) => (
            <li key={`${edge.source}-${edge.target}`}>
              <span>
                {graph.nodes.find((node) => node.key === edge.source)?.label}{" "}
                <ArrowRight size={13} aria-hidden="true" />{" "}
                {graph.nodes.find((node) => node.key === edge.target)?.label}
              </span>
              {kind === "story" ||
              (edge.source === "in_progress" && edge.target === "changes_requested") ||
              (edge.source === "changes_requested" && edge.target === "in_progress") ? (
                <button
                  type="button"
                  aria-label={`Remove transition ${graph.nodes.find((node) => node.key === edge.source)?.label} to ${graph.nodes.find((node) => node.key === edge.target)?.label}`}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      edges: current.edges.filter((item) => item !== edge),
                    }))
                  }
                >
                  <Trash2 size={13} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {canManage && kind === "story" && (
        <form className="workflow-add" onSubmit={addStage}>
          <label htmlFor="workflow-new-stage">Add stage</label>
          <input
            id="workflow-new-stage"
            value={newStage}
            maxLength={80}
            onChange={(event) => setNewStage(event.target.value)}
            placeholder="e.g. QA sign-off"
          />
          <button disabled={!newStage.trim()}>
            <Plus size={15} />
            Add stage
          </button>
        </form>
      )}
      <footer className="workflow-footer">
        <span>
          {graph.configured && graph.enabled
            ? "Transition checks are active after saving."
            : "Save to activate these transition rules."}
        </span>
        <span>
          {graph.nodes.length} stages · {graph.edges.length} transitions{" "}
          {graph.revision ? `· Revision ${graph.revision}` : ""}
        </span>
      </footer>
    </section>
  );
}
