import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardOverviewFeature } from "./DashboardOverviewFeature";

const meta = {
  title: "Dashboard/Features/DashboardOverview",
  component: DashboardOverviewFeature,
  tags: ["autodocs"],
  args: { stats: { totalProjects: 8, completedTasks: 126, pendingTasks: 54, completionRate: 70 }, loading: false },
  parameters: { docs: { description: { component: "Dashboard overview feature composed from task summary cards, project health, and recent activity sections." } } },
} satisfies Meta<typeof DashboardOverviewFeature>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PortfolioOverview: Story = {};
export const Loading: Story = { args: { stats: null, loading: true } };
