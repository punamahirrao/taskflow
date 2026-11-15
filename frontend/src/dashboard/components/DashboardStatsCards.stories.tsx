import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardStatsCards } from "./DashboardStatsCards";

const meta = {
  title: "Dashboard/Components/DashboardStatsCards",
  component: DashboardStatsCards,
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Responsive summary cards for project and task health. Loading cards announce their busy state and keep the same layout to reduce visual shift." } } },
} satisfies Meta<typeof DashboardStatsCards>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { stats: { totalProjects: 2, completedTasks: 38, pendingTasks: 27, completionRate: 58 }, loading: false } };
export const Loading: Story = { args: { stats: null, loading: true } };
export const Empty: Story = { args: { stats: { totalProjects: 0, completedTasks: 0, pendingTasks: 0, completionRate: 0 }, loading: false } };
export const DarkMode: Story = { ...Default, globals: { theme: "night" } };
