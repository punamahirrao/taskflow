import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, waitFor } from "storybook/test";
import { mockTask } from "../../mocks/tasks";
import BacklogPage from "../BacklogPage";

const meta = {
  title: "Backlog/Pages/BacklogPage",
  component: BacklogPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Backlog planning screen with task health metrics, search, and work item actions. All network requests are intercepted by MSW.",
      },
    },
  },
} satisfies Meta<typeof BacklogPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StandardBacklog: Story = {};
export const EmptyBacklog: Story = {
  parameters: {
    msw: {
      handlers: {
        tasks: [http.get("*/tasks/", () => HttpResponse.json([]))],
        sprints: [http.get("*/tasks/sprints/", () => HttpResponse.json([]))],
      },
    },
  },
};
export const DarkMode: Story = { globals: { theme: "night" } };

function reorderFixture(fail = false) {
  let tasks = ["high", "medium", "low"].map((priority, rank) => ({
    ...mockTask,
    id: 700 + rank,
    title: `Reorder item ${rank + 1}`,
    status: "backlog",
    rank,
    priority,
  }));
  let requestCount = 0;
  return {
    handlers: [
      http.get("*/tasks/", () => HttpResponse.json(tasks)),
      http.post("*/tasks/reorder/", async ({ request }) => {
        requestCount++;
        const input = (await request.json()) as { project_id: number; task_ids: number[] };
        expect(input.project_id).toBe(mockTask.project);
        expect(input.task_ids).toEqual([702, 700, 701]);
        if (fail)
          return HttpResponse.json(
            { detail: "Could not save backlog order. Please retry." },
            { status: 503 },
          );
        const ranks = input.task_ids.map((id, rank) => ({ id, rank }));
        tasks = tasks.map((task) => ({
          ...task,
          rank: ranks.find((item) => item.id === task.id)!.rank,
        }));
        return HttpResponse.json({ ranks });
      }),
      http.patch("*/tasks/:taskId/", () => {
        throw new Error("A reorder must not send individual task updates.");
      }),
    ],
    requestCount: () => requestCount,
  };
}

const reorderSuccess = reorderFixture();
export const ReorderBacklog: Story = {
  parameters: { msw: { handlers: { tasks: reorderSuccess.handlers } } },
  play: async ({ canvas }) => {
    const source = (await canvas.findByText("Reorder item 3")).closest<HTMLElement>("[draggable]")!;
    const target = canvas.getByText("Reorder item 1").closest<HTMLElement>("[draggable]")!;
    const transfer = new DataTransfer();
    source.dispatchEvent(
      new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }),
    );
    await expect(transfer.getData("text/plain")).toBe("702");
    target.dispatchEvent(
      new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
    );
    target.dispatchEvent(
      new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
    );
    source.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer: transfer }));
    await waitFor(() =>
      expect(
        canvas.getAllByRole("article").map((card) => card.querySelector("h4")?.textContent),
      ).toEqual(["Reorder item 3", "Reorder item 1", "Reorder item 2"]),
    );
    expect(reorderSuccess.requestCount()).toBe(1);
    expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

const reorderFailure = reorderFixture(true);
export const ReorderFailure: Story = {
  parameters: { msw: { handlers: { tasks: reorderFailure.handlers } } },
  play: async ({ canvas }) => {
    const source = (await canvas.findByText("Reorder item 3")).closest<HTMLElement>("[draggable]")!;
    const target = canvas.getByText("Reorder item 1").closest<HTMLElement>("[draggable]")!;
    const transfer = new DataTransfer();
    source.dispatchEvent(
      new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }),
    );
    await expect(transfer.getData("text/plain")).toBe("702");
    target.dispatchEvent(
      new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
    );
    source.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer: transfer }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Could not save backlog order. Please retry.",
    );
    expect(
      canvas.getAllByRole("article").map((card) => card.querySelector("h4")?.textContent),
    ).toEqual(["Reorder item 1", "Reorder item 2", "Reorder item 3"]);
    expect(reorderFailure.requestCount()).toBe(1);
  },
};
