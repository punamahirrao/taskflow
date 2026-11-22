import { apiFetch } from "../../common/api/client";
import type { WorkflowGraph, WorkflowKind } from "./types";

const endpoint = (projectId: number, kind: WorkflowKind) =>
  `/projects/${projectId}/workflows/${kind}/`;

export const getProjectWorkflow = (projectId: number, kind: WorkflowKind) =>
  apiFetch<WorkflowGraph>(endpoint(projectId, kind));

export const saveProjectWorkflow = (projectId: number, graph: WorkflowGraph) =>
  apiFetch<WorkflowGraph>(endpoint(projectId, graph.kind), {
    method: "PUT",
    body: JSON.stringify(graph),
  });
