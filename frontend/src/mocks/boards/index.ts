import type { AgileBoard } from "../../features/tasks/entities/task";

export const mockBoard: AgileBoard = {
  id: 201,
  project: 101,
  name: "Product Development",
  description: "Plan, build, and ship the customer platform.",
  board_type: "scrum",
  owner: 1,
  owner_name: "Avery Morgan",
  members: [
    { id: 1, name: "Avery Morgan", photo_url: null },
    { id: 2, name: "Jordan Lee", photo_url: null },
    { id: 3, name: "Sam Patel", photo_url: null },
  ],
  member_count: 3,
  task_count: 43,
  sprint_count: 5,
  is_archived: false,
  can_manage: true,
  created_at: "2026-08-01T09:00:00Z",
  updated_at: "2026-11-12T16:30:00Z",
};
export const mockBoards: AgileBoard[] = [
  mockBoard,
  {
    ...mockBoard,
    id: 202,
    name: "Release Kanban",
    description: "Track platform readiness and release operations.",
    board_type: "kanban",
    task_count: 18,
    sprint_count: 0,
    can_manage: false,
  },
];
