import { apiFetch } from "../../common/api/client";
import type { EstimationRun } from "../entities/estimator";
import type { Epic, MacroStory } from "../entities/estimator";

export const startEstimation = (projectId: number, documentId: number, idempotencyKey: string) =>
  apiFetch<EstimationRun>(`/api/ai-estimator/v1/projects/${projectId}/runs/`, {
    method: "POST",
    body: JSON.stringify({ document_id: documentId, idempotency_key: idempotencyKey }),
  });

export const getEstimationRun = (runId: string) =>
  apiFetch<EstimationRun>(`/api/ai-estimator/v1/runs/${encodeURIComponent(runId)}/`);

export const retryEstimation = (runId: string) =>
  apiFetch<EstimationRun>(`/api/ai-estimator/v1/runs/${encodeURIComponent(runId)}/`, {
    method: "POST",
    body: JSON.stringify({}),
  });

export const importEstimationStories = (
  runId: string,
  input: { stories: MacroStory[] } | { epics: Epic[] },
) =>
  apiFetch<{
    created: boolean;
    already_created: boolean;
    task_ids: number[];
    created_count: number;
  }>(`/api/ai-estimator/v1/runs/${encodeURIComponent(runId)}/stories/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
