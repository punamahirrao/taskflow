import { http, HttpResponse } from "msw";
import { mockSprint, mockSprints } from "../sprints";

export const sprintHandlers = [
  http.get("*/tasks/sprints/", () => HttpResponse.json(mockSprints)),
  http.post("*/tasks/sprints/", async ({ request }) => HttpResponse.json({ ...mockSprint, ...await request.json() as object, id: Date.now() }, { status: 201 })),
  http.get("*/tasks/sprints/:sprintId/", () => HttpResponse.json(mockSprint)),
  http.patch("*/tasks/sprints/:sprintId/", async ({ request }) => HttpResponse.json({ ...mockSprint, ...await request.json() as object })),
  http.put("*/tasks/sprints/:sprintId/", async ({ request }) => HttpResponse.json({ ...mockSprint, ...await request.json() as object })),
  http.delete("*/tasks/sprints/:sprintId/", () => new HttpResponse(null, { status: 204 })),
  http.post("*/tasks/sprints/:sprintId/close/", () => HttpResponse.json({ sprint: { ...mockSprint, is_closed: true }, next_sprint: null, moved_count: 0, message: "Sprint completed." })),
];
