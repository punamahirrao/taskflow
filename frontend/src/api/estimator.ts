import { apiFetch } from "./client";

export type EstimatorStage = "queued" | "running" | "complete" | "failed";
export interface EstimationRun {
  id: string;
  project_id: number;
  document_id: number;
  document_name: string;
  status: string;
  stages: Record<string, EstimatorStage>;
  result: {
    macro_stories?: Array<{ id: string; title: string; description: string; story_points: number; requirement_ids?: string[]; rationale?: string; confidence?: number }>;
    total_story_points?: number;
  };
  error: string;
}

export const startEstimation = (projectId: number, documentId: number, idempotencyKey: string) =>
  apiFetch<EstimationRun>(`/api/ai-estimator/v1/projects/${projectId}/runs/`, {
    method: "POST",
    body: JSON.stringify({ document_id: documentId, idempotency_key: idempotencyKey }),
  });

export const getEstimationRun = (runId: string) =>
  apiFetch<EstimationRun>(`/api/ai-estimator/v1/runs/${encodeURIComponent(runId)}/`);

export const retryEstimation = (runId: string) =>
  apiFetch<EstimationRun>(`/api/ai-estimator/v1/runs/${encodeURIComponent(runId)}/`, { method: "POST", body: JSON.stringify({}) });
