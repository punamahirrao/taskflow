import type { Meta, StoryObj } from "@storybook/react-vite";
import CalendarPage from "../CalendarPage";
import { http, HttpResponse } from "msw";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Calendar/Pages/CalendarPage",
  component: CalendarPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A calendar month and upcoming events overview, rendered with realistic planning and release milestones.",
      },
    },
  },
} satisfies Meta<typeof CalendarPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StandardOrganization: Story = {};
export const MonthNavigation: Story = {
  parameters: {
    msw: {
      handlers: {
        calendar: [
          http.get("*/dashboard/calendar/", ({ request }) => {
            const date = new URL(request.url).searchParams.get("start");
            return HttpResponse.json([
              {
                id: "target-1",
                title: `Delivery target ${date}`,
                date,
                kind: "task",
                project_id: 101,
              },
            ]);
          }),
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const event = await canvas.findByRole("link", { name: /Delivery target/ });
    await expect(event).toHaveAttribute("href", "/project/101");
    const initialMonth = canvas.getByRole("heading", { level: 2 }).textContent;
    await userEvent.click(canvas.getByRole("button", { name: "Next month" }));
    await waitFor(() =>
      expect(canvas.getByRole("heading", { level: 2 }).textContent).not.toBe(initialMonth),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Previous month" }));
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent(initialMonth!);
    await expect(await canvas.findByRole("link", { name: /Delivery target/ })).toBeVisible();
  },
};
export const DarkMode: Story = { globals: { theme: "night" } };
