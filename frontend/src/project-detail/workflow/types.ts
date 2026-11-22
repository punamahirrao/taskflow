export type WorkflowKind = "story" | "release";
export type WorkflowNode = { key: string; label: string; x: number; y: number; editable?: boolean };
export type WorkflowEdge = { source: string; target: string };
export type WorkflowGraph = {
  kind: WorkflowKind;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  start_key: string;
  end_key: string;
  enabled: boolean;
  configured: boolean;
  revision: number;
  can_manage: boolean;
};
