import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import MyWorkPage from "../MyWorkPage";

const meta = {
  title: "My Work/Pages/MyWorkPage",
  component: MyWorkPage,
  tags: ["autodocs"],
  parameters: { route: "/my-work" },
} satisfies Meta<typeof MyWorkPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const AssignedApprovals: Story = {
  parameters: { route: "/my-work?view=approvals" },
  async play({ canvas }) {
    await expect(
      await canvas.findByRole("link", { name: "Atlas account recovery 1.2 Product acceptance" }),
    ).toBeVisible();
    await expect(canvas.getByText("Needs your review", { exact: true })).toBeVisible();
  },
};
export const PrivateDocuments: Story = {
  parameters: { route: "/my-work?view=documents" },
};
