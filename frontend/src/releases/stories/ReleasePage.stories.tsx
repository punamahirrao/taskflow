import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { http, HttpResponse } from "msw";
import { mockReleaseDirectory } from "../../mocks/releases";
import ReleasePage from "../ReleasePage";

const meta = {
  title: "Releases/Pages/ReleasePage",
  component: ReleasePage,
  tags: ["autodocs"],
  parameters: { route: "/releases" },
} satisfies Meta<typeof ReleasePage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewingRelease: Story = {
  async play({ canvas, userEvent }) {
    await expect(
      await canvas.findByRole("heading", { name: "Atlas account recovery 1.2" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Approve" })).toBeVisible();
    await userEvent.selectOptions(canvas.getByLabelText("Filter by release status"), "done");
    await expect(canvas.getByRole("heading", { name: "Atlas onboarding 1.1" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Make account recovery easier" })).toBeVisible();
  },
};
export const EmptyReleaseList: Story = {
  parameters: {
    msw: {
      handlers: {
        releases: [
          http.get("*/projects/releases/", () =>
            HttpResponse.json({ ...mockReleaseDirectory, items: [] }),
          ),
        ],
      },
    },
  },
};
