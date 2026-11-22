import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import WorkflowDesigner from "../WorkflowDesigner";
import type { WorkflowGraph, WorkflowKind } from "../types";

function fixture(canManage = true) {
  const saved: Record<WorkflowKind, WorkflowGraph> = {
    story: {
      kind: "story",
      nodes: [
        { key: "backlog", label: "Backlog", x: 60, y: 60, editable: true },
        { key: "todo", label: "To do", x: 360, y: 60, editable: true },
        { key: "done", label: "Done", x: 660, y: 60, editable: true },
      ],
      edges: [
        { source: "backlog", target: "todo" },
        { source: "todo", target: "done" },
      ],
      start_key: "backlog",
      end_key: "done",
      enabled: false,
      configured: false,
      revision: 0,
      can_manage: canManage,
    },
    release: {
      kind: "release",
      nodes: [
        { key: "planned", label: "Planned", x: 60, y: 60 },
        { key: "in_progress", label: "In progress", x: 360, y: 60 },
        { key: "done", label: "Done", x: 660, y: 60 },
      ],
      edges: [
        { source: "planned", target: "in_progress" },
        { source: "in_progress", target: "done" },
      ],
      start_key: "planned",
      end_key: "done",
      enabled: false,
      configured: false,
      revision: 0,
      can_manage: canManage,
    },
  };
  const get = (kind: WorkflowKind) =>
    http.get(`*/projects/12/workflows/${kind}/`, () => HttpResponse.json(saved[kind]));
  const put = (kind: WorkflowKind) =>
    http.put(`*/projects/12/workflows/${kind}/`, async ({ request }) => {
      const input = (await request.json()) as WorkflowGraph;
      saved[kind] = {
        ...input,
        configured: true,
        enabled: true,
        revision: input.revision + 1,
      };
      return HttpResponse.json(saved[kind]);
    });
  const handlers = [get("story"), get("release"), put("story"), put("release")];
  return { saved, handlers };
}

const meta = {
  title: "Project Settings/Workflow Designer",
  component: WorkflowDesigner,
  args: { projectId: 12 },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof WorkflowDesigner>;
export default meta;
type Story = StoryObj<typeof meta>;

const editable = fixture();
export const Editable: Story = {
  parameters: { msw: { handlers: editable.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("textbox", { name: "Stage name for Backlog" });
    const grip = canvas.getByRole("button", { name: "Move Backlog" });
    const before = grip.parentElement?.style.left;
    fireEvent.keyDown(grip, { key: "ArrowRight" });
    await waitFor(() => expect(grip.parentElement?.style.left).not.toBe(before));
    await userEvent.type(canvas.getByLabelText("Add stage"), "Security review");
    await userEvent.click(canvas.getByRole("button", { name: "Add stage" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save workflow" }));
    await canvas.findByText("Workflow saved and transition rules are active.");
    expect(editable.saved.story.nodes.some((node) => node.label === "Security review")).toBe(true);
    expect(editable.saved.story.enabled).toBe(true);
  },
};

const readOnly = fixture(false);
export const ReadOnly: Story = {
  parameters: { msw: { handlers: readOnly.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("button", { name: "Move Backlog" });
    expect(canvas.queryByLabelText("Add stage")).toBeNull();
    expect(canvas.queryByRole("button", { name: "Save workflow" })).toBeNull();
  },
};
