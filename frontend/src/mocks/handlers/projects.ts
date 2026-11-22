import { http, HttpResponse } from "msw";
import { mockProject, mockProjects } from "../projects";
import type { ProjectAccessRequest } from "../../projects/api/projects";

const requestedProjects = new Set<number>();

export const projectHandlers = [
  http.get("*/projects/directory/", ({ request }) => {
    const query = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? "";
    return HttpResponse.json(
      [
        ...mockProjects.map((project) => ({ ...project, has_access: true, is_assigned: true })),
        {
          id: 9999,
          name: "Organization Discovery Demo",
          has_access: false,
          is_assigned: false,
          description:
            "Coordinate the next launch across design, engineering, and customer success.",
          status: "upcoming",
          end_date: "2026-12-18",
          owner_details: { id: 2, name: "Jordan Lee", photo_url: null },
          access_request_status: requestedProjects.has(9999) ? "pending" : null,
        },
      ].filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(query)),
    );
  }),
  http.get("*/projects/access-requests/", () => HttpResponse.json([])),
  http.post("*/projects/:projectId/access-requests/", async ({ params, request }) => {
    const projectId = Number(params.projectId);
    const input = (await request.json()) as Pick<ProjectAccessRequest, "reason" | "requested_role">;
    requestedProjects.add(projectId);
    return HttpResponse.json(
      {
        id: projectId,
        project_id: projectId,
        project_name: "Organization Discovery Demo",
        requester: { id: 1, name: "Avery Morgan" },
        ...input,
        status: "pending",
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
  http.get("*/projects/", () => HttpResponse.json(mockProjects)),
  http.post("*/projects/", async ({ request }) =>
    HttpResponse.json(
      { ...mockProject, ...((await request.json()) as object), id: Date.now() },
      { status: 201 },
    ),
  ),
  http.get("*/projects/:projectId/", ({ params }) => {
    const id = Number(params.projectId);
    if (!Number.isInteger(id)) return;
    const project = mockProjects.find((item) => item.id === id);
    return project
      ? HttpResponse.json(project)
      : HttpResponse.json({ detail: "Project not found." }, { status: 404 });
  }),
  http.put("*/projects/:projectId/", async ({ params, request }) =>
    HttpResponse.json({
      ...mockProject,
      ...((await request.json()) as object),
      id: Number(params.projectId),
    }),
  ),
  http.patch("*/projects/:projectId/", async ({ params, request }) =>
    HttpResponse.json({
      ...mockProject,
      ...((await request.json()) as object),
      id: Number(params.projectId),
    }),
  ),
  http.delete("*/projects/:projectId/", () => new HttpResponse(null, { status: 204 })),
  http.put("*/projects/default/", () => HttpResponse.json({ default_project_id: mockProject.id })),
  http.post("*/projects/default/", () => HttpResponse.json({ default_project_id: mockProject.id })),
];
