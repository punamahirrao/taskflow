import { http, HttpResponse } from "msw";
import { mockTask, mockTasks } from "../tasks";

const tasksUrl = "*/tasks/";

export const taskHandlers = [
  http.get(tasksUrl, () => HttpResponse.json(mockTasks)),
  http.post(tasksUrl, async ({ request }) => {
    const input = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockTask, ...input, id: Date.now() }, { status: 201 });
  }),
  http.get("*/tasks/:taskId/", ({ params }) => HttpResponse.json(mockTasks.find((task) => task.id === Number(params.taskId)) ?? mockTask)),
  http.patch("*/tasks/:taskId/", async ({ params, request }) => {
    const input = await request.json() as Record<string, unknown>;
    const task = mockTasks.find((item) => item.id === Number(params.taskId)) ?? mockTask;
    return HttpResponse.json({ ...task, ...input });
  }),
  http.put("*/tasks/:taskId/", async ({ params, request }) => {
    const input = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockTask, ...input, id: Number(params.taskId) });
  }),
  http.delete("*/tasks/:taskId/", () => new HttpResponse(null, { status: 204 })),
];
