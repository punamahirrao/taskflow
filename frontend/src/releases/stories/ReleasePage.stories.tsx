import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, within, waitFor } from "storybook/test";
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

export const CreateReleaseDraft: Story = {
  parameters: {
    msw: {
      handlers: {
        releaseCreation: [
          http.post("*/projects/releases/", async ({ request }) => {
            const values = (await request.json()) as { name: string };
            expect(values.name).toBe("Customer launch");
            return HttpResponse.json(
              { ...mockReleaseDirectory.items[0], name: values.name },
              { status: 201 },
            );
          }),
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Create release" }));
    const dialog = within(canvas.getByRole("dialog"));
    await userEvent.type(dialog.getByRole("textbox", { name: "Release name" }), "Customer launch");
    await userEvent.click(dialog.getByRole("button", { name: "Create release" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

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
