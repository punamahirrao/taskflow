import type { Meta, StoryObj } from "@storybook/react-vite";
import { Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import BoardsPage from "../BoardsPage";
import { mockTasks } from "../../mocks/tasks";
import type { BoardColumn, Task } from "../../features/tasks/entities/task";

const columns: BoardColumn[] = [
  ["backlog", "Backlog"],
  ["todo", "To Do"],
  ["in_progress", "In Progress"],
  ["review", "Review"],
  ["done", "Done"],
].map(([key, name], index) => ({
  id: 501 + index,
  key,
  name,
  position: index,
  status_order: 0,
  group_name: name,
  wip_limit: null,
  statuses: [{ id: 601 + index, key, name, position: 0, is_system: true }],
}));

let tasks: Task[] = [];
const meta = {
  title: "Boards/Pages/BoardsPage",
  component: BoardsPage,
  decorators: [
    (Story) => (
      <Routes>
        <Route path="/boards/:boardId" element={<Story />} />
      </Routes>
    ),
  ],
  beforeEach: () => {
    tasks = structuredClone(mockTasks);
    tasks.push({ ...mockTasks[0], id: 406, title: "Plan next sprint delivery", sprint: 302 });
  },
  parameters: {
    route: "/boards/201?project=101",
    msw: {
      handlers: {
        boardWorkspace: [
          http.get("*/tasks/", () => HttpResponse.json(tasks)),
          http.patch("*/tasks/:taskId/", async ({ request, params }) => {
            const task = tasks.find((item) => item.id === Number(params.taskId));
            if (!task) return new HttpResponse(null, { status: 404 });
            Object.assign(task, await request.json());
            return HttpResponse.json(task);
          }),
          http.get("*/tasks/projects/:projectId/boards/:boardId/columns/", () =>
            HttpResponse.json(columns),
          ),
          http.get("*/tasks/:taskId/comments/", () => HttpResponse.json([])),
          http.get("*/tasks/:taskId/history/", () => HttpResponse.json([])),
        ],
      },
    },
  },
} satisfies Meta<typeof BoardsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SprintFiltersAndSwimlanes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByTestId("board-task-401");
    await expect(canvas.queryByTestId("board-task-406")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /active sprint.*backlog/i }));
    await canvas.findByTestId("board-task-406");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: /swimlanes/i }), "priority");
    const lane = within(canvas.getByRole("region", { name: "In Progress column" }));
    await expect(lane.getByText("High")).toBeVisible();
    await userEvent.selectOptions(canvas.getByTestId("choose-board-input"), "202");
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: /all work/i })).not.toBeInTheDocument(),
    );
    await expect(canvas.getByRole("heading", { name: "Release Kanban" })).toBeVisible();
  },
};

export const KeyboardTaskDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const task = await canvas.findByTestId("board-task-401");
    task.focus();
    await userEvent.keyboard("{Enter}");
    await canvas.findByRole("button", { name: /close story details/i });
    await expect(canvasElement.querySelector(".board-page-details-open")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvas.queryByTestId("sprint-story-details")).not.toBeInTheDocument(),
    );
  },
};

export const MovingBacklogWork: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByTestId("board-task-401");
    const task = await canvas.findByTestId("board-task-403");
    const transfer = new DataTransfer();
    task
      .closest("[draggable]")!
      .dispatchEvent(
        new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }),
      );
    await expect(transfer.getData("text/plain")).toBe("403");
    const progress = canvas.getByRole("region", { name: "In Progress column" });
    progress
      .querySelector("section")!
      .dispatchEvent(
        new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
      );
    await waitFor(() => expect(within(progress).getByTestId("board-task-403")).toBeVisible());
    await waitFor(() =>
      expect(tasks.find((item) => item.id === 403)).toMatchObject({
        status: "in_progress",
        sprint: 301,
      }),
    );
    const backlog = canvas.getByRole("region", { name: "Backlog column" });
    backlog
      .querySelector("section")!
      .dispatchEvent(
        new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
      );
    await waitFor(() => expect(within(backlog).getByTestId("board-task-403")).toBeVisible());
    await waitFor(() =>
      expect(tasks.find((item) => item.id === 403)).toMatchObject({
        status: "backlog",
        sprint: null,
      }),
    );
  },
};
