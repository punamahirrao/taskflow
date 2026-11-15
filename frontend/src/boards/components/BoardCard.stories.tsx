import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BoardCard } from "./BoardCard";
import { mockBoard } from "../../mocks/boards";
import { mockProject } from "../../mocks/projects";

const meta = {
  title: "Boards/Components/BoardCard",
  component: BoardCard,
  tags: ["autodocs"],
  args: {
    board: mockBoard, project: mockProject, canManage: true, menuOpen: false,
    onOpen: fn(), onMenu: fn(), onEdit: fn(), onArchive: fn(), onProjectSettings: fn(),
  },
  parameters: { docs: { description: { component: "A project board summary card with board metrics, collaborators, and management actions. Keyboard users can activate the board and actions with standard buttons." } } },
} satisfies Meta<typeof BoardCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { render: () => <div role="status" aria-label="Loading boards" className="h-64 animate-pulse rounded-2xl border border-line bg-subtle" /> };
export const Empty: Story = { args: { board: { ...mockBoard, task_count: 0, sprint_count: 0, member_count: 0, members: [], description: "" } } };
export const Error: Story = { render: () => <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-danger">Boards could not be loaded. Try again.</p> };
export const LongContent: Story = { args: { board: { ...mockBoard, name: "Customer Platform Modernization and Global Identity Management", description: "A cross-functional initiative spanning account recovery, customer identity, accessibility, compliance, analytics, and the global onboarding experience." }, project: { ...mockProject, name: "Atlas Customer Experience Modernization" } } };
export const DarkMode: Story = { globals: { theme: "night" } };
export const OpenManagementMenu: Story = { args: { menuOpen: true } };
export const OpenBoardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getAllByRole("button")[0]);
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
};
