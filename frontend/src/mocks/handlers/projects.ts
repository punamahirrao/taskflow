import { http, HttpResponse } from "msw";
import { mockProject, mockProjects } from "../projects";

export const projectHandlers = [
  http.get("*/projects/", () => HttpResponse.json(mockProjects)),
  http.post("*/projects/", async ({ request }) => HttpResponse.json({ ...mockProject, ...await request.json() as object, id: Date.now() }, { status: 201 })),
  http.get("*/projects/:projectId/", ({ params }) => HttpResponse.json(mockProjects.find((project) => project.id === Number(params.projectId)) ?? mockProject)),
  http.put("*/projects/:projectId/", async ({ params, request }) => HttpResponse.json({ ...mockProject, ...await request.json() as object, id: Number(params.projectId) })),
  http.patch("*/projects/:projectId/", async ({ params, request }) => HttpResponse.json({ ...mockProject, ...await request.json() as object, id: Number(params.projectId) })),
  http.delete("*/projects/:projectId/", () => new HttpResponse(null, { status: 204 })),
  http.put("*/projects/default/", () => HttpResponse.json({ default_project_id: mockProject.id })),
  http.post("*/projects/default/", () => HttpResponse.json({ default_project_id: mockProject.id })),
];
