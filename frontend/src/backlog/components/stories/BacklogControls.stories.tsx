import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BacklogControls } from "../BacklogControls";

const meta = {
  title: "Backlog/Components/BacklogControls",
  component: BacklogControls,
  tags: ["autodocs"],
  args: {
    mode: "groom",
    setMode: fn(),
    groupBy: "project",
    setGroupBy: fn(),
    search: "",
    setSearch: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controls for refining backlog work: search, grouping, and estimate mode. Controls are labeled for keyboard and screen reader access.",
      },
    },
  },
} satisfies Meta<typeof BacklogControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const EstimationMode: Story = {
  args: { mode: "estimate", groupBy: "theme" },
};
