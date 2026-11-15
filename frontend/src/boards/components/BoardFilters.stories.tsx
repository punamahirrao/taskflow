import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BoardFilters } from "./BoardFilters";

const meta = {
  title: "Boards/Components/BoardFilters",
  component: BoardFilters,
  tags: ["autodocs"],
  args: { search: "", type: "all", sort: "updated", tab: "all", onSearch: fn(), onType: fn(), onSort: fn(), onTab: fn() },
  parameters: { docs: { description: { component: "Search, board type, sort, and visibility controls for a board list. Each control has a visible label and keyboard support." } } },
} satisfies Meta<typeof BoardFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const FilteredByKanban: Story = { args: { search: "release", type: "kanban", tab: "mine" } };
export const LongSearch: Story = { args: { search: "Customer Platform Modernization and Global Identity Management" } };
