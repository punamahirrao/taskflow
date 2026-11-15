import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecentActivitySection } from "./RecentActivitySection";

const meta = {
  title: "Dashboard/Sections/RecentActivitySection",
  component: RecentActivitySection,
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "A semantic activity feed with actor, project, timestamp, and optional comment context." } } },
} satisfies Meta<typeof RecentActivitySection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const RecentActivity: Story = {};
export const DarkMode: Story = { globals: { theme: "night" } };
