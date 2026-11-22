import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { groupBacklogTasks } from "../../features/agile/utils/backlog";
import { mockProjects } from "../../../mocks/projects";
import { mockSprint } from "../../../mocks/sprints";
import { mockTasks } from "../../../mocks/tasks";
import { BacklogWorkList } from "../BacklogWorkList";

const backlog = mockTasks.filter((task) => task.status === "backlog");
const meta = {
  title: "Backlog/Sections/BacklogWorkList",
  component: BacklogWorkList,
  tags: ["autodocs"],
  args: {
    loading: false,
    backlog,
    tasks: mockTasks,
    projects: mockProjects,
    groups: groupBacklogTasks(backlog, mockProjects, "project"),
    activeSprint: mockSprint,
    sprintBusy: false,
    epicRollups: new Map(),
    onCapture: fn(),
    onReorder: fn(),
    onUpdate: fn(async () => undefined),
    onEdit: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Backlog work items grouped by project, with sprint, edit, and prioritization actions. Empty and loading states are provided as explicit variants.",
      },
    },
  },
} satisfies Meta<typeof BacklogWorkList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithWork: Story = {};
export const Empty: Story = { args: { backlog: [], groups: [] } };
export const Loading: Story = { args: { loading: true } };
