import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { http, HttpResponse } from "msw";
import { mockTask } from "../../mocks/tasks";
import type { Task } from "../../features/tasks/entities/task";
import { todayDate, dayNumber, isoDate } from "../utils/roadmapModel";
import RoadmapPage from "../RoadmapPage";

const meta = {
  title: "Roadmap/Pages/RoadmapPage",
  component: RoadmapPage,
  tags: ["autodocs"],
  parameters: { route: "/planning/roadmap" },
} satisfies Meta<typeof RoadmapPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FeaturePlan: Story = {
  parameters: {
    msw: {
      handlers: {
        tasks: [
          http.get("*/tasks/", () => {
            const today = dayNumber(todayDate()) ?? 0;
            const feature: Task = {
              ...mockTask,
              id: 810,
              title: "Safer account recovery",
              work_type: "epic",
              planned_start_date: isoDate(today - 2),
              due_date: isoDate(today + 4),
              story_ids: [812],
            };
            return HttpResponse.json([
              feature,
              {
                ...feature,
                id: 811,
                title: "Pilot passkey rollout",
                blocked_by: [810],
                planned_start_date: isoDate(today + 5),
                due_date: isoDate(today + 12),
                story_ids: [],
              },
              {
                ...mockTask,
                id: 812,
                title: "Verify fallback email flow",
                work_type: "story",
                status: "done",
                parent: 810,
              },
            ]);
          }),
        ],
      },
    },
  },
  async play({ canvas }) {
    await expect(await canvas.findByRole("heading", { name: "RoadMap" })).toBeVisible();
    await expect(await canvas.findAllByText("Safer account recovery")).not.toHaveLength(0);
  },
};
