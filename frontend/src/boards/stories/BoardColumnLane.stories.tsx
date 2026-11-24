import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { mockTasks } from "../../mocks/tasks";
import { BoardColumnLane } from "../features/column-lane/BoardColumnLane";

const inProgressTask = mockTasks.find((task) => task.status === "in_progress")!;
const column = {
  id: 501,
  name: "In Progress",
  key: "in_progress",
  position: 2,
  status_order: 0,
  group_name: "In Progress",
  wip_limit: 5,
  statuses: [{ id: 601, key: "in_progress", name: "In Progress", position: 0, is_system: true }],
};
const meta = {
  title: "Boards/Components/BoardColumnLane",
  component: BoardColumnLane,
  tags: ["autodocs"],
  args: {
    groupName: "In Progress",
    columns: [column],
    tasks: [inProgressTask],
    swimlane: "project",
    projects: [{ id: 101, name: "Atlas Customer Platform" }],
    projectSelected: true,
    canCustomize: true,
    busy: false,
    overLimit: false,
    aggregateLimit: 5,
    onSaveLimit: fn(),
    onMove: fn(),
    renderTask: (task) => (
      <article
        key={task.id}
        className="rounded-lg border border-line bg-surface p-3 text-sm font-medium text-content"
      >
        {task.title}
      </article>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "A board column that groups task cards by workflow status and supports drag/drop status changes, work-in-progress limits, and empty states.",
      },
    },
  },
} satisfies Meta<typeof BoardColumnLane>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithWork: Story = {};
export const Empty: Story = { args: { tasks: [] } };
export const OverWorkLimit: Story = {
  args: {
    tasks: Array.from({ length: 6 }, (_, index) => ({
      ...inProgressTask,
      id: inProgressTask.id + index,
      title: `${inProgressTask.title} ${index + 1}`,
    })),
    overLimit: true,
  },
};
