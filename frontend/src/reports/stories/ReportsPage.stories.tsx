import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import ReportsPage from "../ReportsPage";

const meta = { title: "Reports/Pages/ReportsPage", component: ReportsPage } satisfies Meta<
  typeof ReportsPage
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DeliveryOverview: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Reports" })).toBeVisible();
    await expect(await canvas.findByText("Platform Sprint 12")).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Work by status" })).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Sprint delivery vs capacity" }),
    ).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Velocity trend" })).toBeVisible();
  },
};
