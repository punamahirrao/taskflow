import { apiFetch } from "../../common/api/client";
import type { PlanningRecord } from "../entities/planning";

export const getPlanningRecords = (kind: string, signal?: AbortSignal) =>
  apiFetch<{ items: PlanningRecord[]; can_manage: boolean }>(
    `/projects/planning/?kind=${encodeURIComponent(kind)}`,
    { signal },
  );
export const savePlanningRecord = (values: Omit<PlanningRecord, "id">, id?: number) =>
  apiFetch<PlanningRecord>(`/projects/planning/${id ? `${id}/` : ""}`, {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(values),
  });
