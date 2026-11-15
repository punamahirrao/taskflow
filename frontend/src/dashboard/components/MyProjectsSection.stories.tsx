import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyProjectsSection } from "./MyProjectsSection";

const meta = {
  title: "Dashboard/Sections/MyProjectsSection",
  component: MyProjectsSection,
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "A dashboard section showing project health, progress, due dates, and team summaries." } } },
} satisfies Meta<typeof MyProjectsSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StandardPortfolio: Story = {};
export const DarkMode: Story = { globals: { theme: "night" } };
