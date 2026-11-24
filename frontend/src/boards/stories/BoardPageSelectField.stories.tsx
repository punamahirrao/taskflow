import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BoardPageSelectField } from "../components/shared/BoardPageSelectField";

const meta = {
  title: "Boards/Components/BoardPageSelectField",
  component: BoardPageSelectField,
  tags: ["autodocs"],
  args: {
    id: "swimlane",
    label: "Group lanes",
    value: "project",
    testId: "swimlane",
    onChange: fn(),
    children: (
      <>
        <option value="project">Project</option>
        <option value="priority">Priority</option>
        <option value="assignee">Assignee</option>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Labeled board select control with stable test IDs and keyboard-operable native options.",
      },
    },
  },
} satisfies Meta<typeof BoardPageSelectField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
