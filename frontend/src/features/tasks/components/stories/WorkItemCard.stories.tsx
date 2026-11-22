import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { mockTask, mockTasks } from "../../../../mocks/tasks";
import { WorkItemCard } from "../WorkItemCard";

const meta = {
  title: "Agile/Components/WorkItemCard",
  component: WorkItemCard,
  tags: ["autodocs"],
  args: { task: mockTask, candidates: mockTasks, onEdit: fn(), onAssign: fn(), onEscalate: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "A compact, keyboard-accessible agile task card with priority, estimate, status, assignment, and sprint actions.",
      },
    },
  },
} satisfies Meta<typeof WorkItemCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
export const Blocked: Story = { args: { task: { ...mockTask, blocked: true, blocked_by: [402] } } };
export const Unassigned: Story = {
  args: {
    task: { ...mockTask, assignee: null, assignee_name: "", sprint: null, sprint_name: null },
    sprintAction: "plan",
  },
};
export const LongContent: Story = {
  args: {
    task: {
      ...mockTask,
      title: "Coordinate customer identity migration across regional platform services",
      description:
        "Plan a phased migration with security review, customer communication, observability, and rollback coverage.",
    },
  },
};
export const DarkMode: Story = { ...Default, globals: { theme: "night" } };
export const EditInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("article", {
        name: /task card: create release readiness checklist/i,
      }),
    );
    await expect(args.onEdit).toHaveBeenCalledOnce();
  },
};
