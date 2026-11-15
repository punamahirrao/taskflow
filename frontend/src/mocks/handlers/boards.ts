import { http, HttpResponse } from "msw";
import { mockBoard, mockBoards } from "../boards";

export const boardHandlers = [
  http.get("*/tasks/boards/", ({ request }) => {
    const archived = new URL(request.url).searchParams.get("archived") === "true";
    return HttpResponse.json(archived ? [] : mockBoards);
  }),
  http.get("*/tasks/projects/:projectId/boards/", () => HttpResponse.json(mockBoards)),
  http.post("*/tasks/projects/:projectId/boards/", async ({ request }) => HttpResponse.json({ ...mockBoard, ...await request.json() as object, id: Date.now() }, { status: 201 })),
  http.put("*/tasks/projects/:projectId/boards/:boardId/", async ({ params, request }) => HttpResponse.json({ ...mockBoard, ...await request.json() as object, id: Number(params.boardId) })),
  http.patch("*/tasks/projects/:projectId/boards/:boardId/", async ({ params, request }) => HttpResponse.json({ ...mockBoard, ...await request.json() as object, id: Number(params.boardId) })),
  http.delete("*/tasks/projects/:projectId/boards/:boardId/", () => new HttpResponse(null, { status: 204 })),
  http.get("*/tasks/projects/:projectId/boards/:boardId/columns/", () => HttpResponse.json([])),
  http.get("*/tasks/projects/:projectId/columns/", () => HttpResponse.json([])),
  http.get("*/tasks/projects/:projectId/workflow/", () => HttpResponse.json({ statuses: [], columns: [], can_manage: true })),
  http.get("*/tasks/projects/:projectId/boards/:boardId/workflow/", () => HttpResponse.json({ statuses: [], columns: [], can_manage: true })),
];
