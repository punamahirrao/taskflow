import { http, HttpResponse } from "msw";
import { mockTask, mockTasks } from "../tasks";
import { mockUser } from "../users";

const tasksUrl = "*/tasks/";

export const taskHandlers = [
  http.post("*/tasks/reorder/", async ({ request }) => {
    const { task_ids } = (await request.json()) as { task_ids: number[] };
    return HttpResponse.json({ ranks: task_ids.map((id, rank) => ({ id, rank })) });
  }),
  http.get(tasksUrl, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const mine = params.get("mine") === "true";
    const project = params.get("project_id");
    return HttpResponse.json(
      mockTasks.filter(
        (task) =>
          (!mine || task.assignee === mockUser.id) &&
          (!project || task.project === Number(project)),
      ),
    );
  }),
  http.post(tasksUrl, async ({ request }) => {
    const input = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockTask, ...input, id: Date.now() }, { status: 201 });
  }),
  http.get("*/tasks/:taskId/", ({ params }) =>
    HttpResponse.json(mockTasks.find((task) => task.id === Number(params.taskId)) ?? mockTask),
  ),
  http.patch("*/tasks/:taskId/", async ({ params, request }) => {
    const input = (await request.json()) as Record<string, unknown>;
    const task = mockTasks.find((item) => item.id === Number(params.taskId)) ?? mockTask;
    return HttpResponse.json({ ...task, ...input });
  }),
  http.put("*/tasks/:taskId/", async ({ params, request }) => {
    const input = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockTask, ...input, id: Number(params.taskId) });
  }),
  http.delete("*/tasks/:taskId/", () => new HttpResponse(null, { status: 204 })),
];
