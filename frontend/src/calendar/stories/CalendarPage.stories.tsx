import type { Meta, StoryObj } from "@storybook/react-vite";
import CalendarPage from "../CalendarPage";

const meta = {
  title: "Calendar/Pages/CalendarPage",
  component: CalendarPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A calendar month and upcoming events overview, rendered with realistic planning and release milestones.",
      },
    },
  },
} satisfies Meta<typeof CalendarPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StandardOrganization: Story = {};
export const DarkMode: Story = { globals: { theme: "night" } };
