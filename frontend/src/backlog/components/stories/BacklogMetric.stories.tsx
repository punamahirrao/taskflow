import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarClock } from "lucide-react";
import { BacklogMetric } from "../health-summary/BacklogMetric";

const meta = {
  title: "Backlog/Components/BacklogMetric",
  component: BacklogMetric,
  tags: ["autodocs"],
  args: {
    label: "Ready for sprint",
    value: 12,
    icon: <CalendarClock size={16} />,
    tint: "green",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A compact, non-interactive backlog health metric. Keep labels descriptive so the value remains understandable to assistive technology.",
      },
    },
  },
} satisfies Meta<typeof BacklogMetric>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = {
  args: { value: 0, tint: undefined },
};
export const LongContent: Story = {
  args: {
    label: "Items blocked by cross-team dependencies",
    value: 124,
  },
};
export const DarkMode: Story = { ...Default, globals: { theme: "night" } };
