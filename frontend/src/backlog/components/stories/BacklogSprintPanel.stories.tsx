import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { mockSprint, mockSprints } from "../../../mocks/sprints";
import { BacklogSprintPanel } from "../BacklogSprintPanel";

const meta = {
  title: "Backlog/Components/BacklogSprintPanel",
  component: BacklogSprintPanel,
  tags: ["autodocs"],
  args: {
    projectId: 101,
    projectRole: "owner",
    sprints: mockSprints,
    activeSprints: [mockSprint],
    activeSprint: mockSprint,
    onSelectActive: fn(),
    readyCount: 3,
    backlogPoints: 21,
    busy: false,
    name: "Platform Sprint 13",
    setName: fn(),
    goal: "Improve account recovery",
    setGoal: fn(),
    capacity: "32",
    setCapacity: fn(),
    startDate: "2026-11-23",
    setStartDate: fn(),
    endDate: "2026-12-04",
    setEndDate: fn(),
    onCreate: fn(),
    onPlanReady: fn(),
    onStartPlanned: fn(),
    onClose: fn(),
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Sprint planning and active sprint controls for the backlog. The page owns API state; this component exposes planning actions through callbacks.",
      },
    },
  },
} satisfies Meta<typeof BacklogSprintPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ActiveSprint: Story = {};
export const NoActiveSprint: Story = {
  args: {
    activeSprint: undefined,
    activeSprints: [],
    sprints: mockSprints.map((sprint) => ({ ...sprint, is_active: false })),
  },
};
export const Loading: Story = { args: { busy: true } };
