import { apiFetch } from "../../common/api/client";
import type {
  AbsenceInput,
  CapacityPlan,
  HolidayInput,
  SprintCapacity,
} from "../entities/capacity";

const path = (id: number) => `/tasks/sprints/${id}/capacity/`;
export const getSprintCapacity = (id: number) => apiFetch<SprintCapacity>(path(id));
export const saveCapacityPlan = (id: number, members: CapacityPlan) =>
  apiFetch<SprintCapacity>(path(id), { method: "PUT", body: JSON.stringify({ members }) });
export const logSprintAbsence = (id: number, input: AbsenceInput) =>
  apiFetch<SprintCapacity>(`${path(id)}absences/`, { method: "POST", body: JSON.stringify(input) });
export const logSprintHoliday = (id: number, input: HolidayInput) =>
  apiFetch<SprintCapacity>(`${path(id)}holidays/`, { method: "POST", body: JSON.stringify(input) });
export const removeAvailabilityEntry = (
  id: number,
  kind: "absences" | "holidays",
  entryId: number,
) => apiFetch<SprintCapacity>(`${path(id)}${kind}/${entryId}/`, { method: "DELETE" });
