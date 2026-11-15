import type { Sprint } from "../../common/entities/task";

export const mockSprint: Sprint = {
  id: 301, project: 101, board: 201, name: "Platform Sprint 12", start_date: "2026-11-09", end_date: "2026-11-20",
  is_active: true, is_closed: false, goal: "Ship a faster account recovery experience.", capacity_points: 32,
  velocity_points: 28, outcome_summary: "", retrospective: "", created_at: "2026-11-02T10:00:00Z",
};
export const mockSprints: Sprint[] = [mockSprint, { ...mockSprint, id: 302, name: "Platform Sprint 13", start_date: "2026-11-23", end_date: "2026-12-04", is_active: false, capacity_points: 30 }];
