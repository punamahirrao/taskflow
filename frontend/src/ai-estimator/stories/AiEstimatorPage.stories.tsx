import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, waitFor } from "storybook/test";
import AiEstimatorPage from "../AiEstimatorPage";
import type { EstimationRun } from "../entities/estimator";

const run: EstimationRun = {
  id: "estimate-1",
  project_id: 101,
  document_id: 801,
  document_name: "Release acceptance notes.txt",
  status: "ready_for_review",
  error: "",
  stages: {
    parsing: "complete",
    extracting: "complete",
    grouping: "complete",
    estimating: "complete",
  },
  result: {
    macro_stories: [
      {
        id: "EP-01",
        title: "Release readiness",
        description: "Prepare release checks",
        story_points: 5,
      },
    ],
  },
};
const meta = {
  title: "AI Estimator/Pages/AiEstimatorPage",
  component: AiEstimatorPage,
  parameters: {
    msw: {
      handlers: {
        estimator: [
          http.post("*/api/ai-estimator/v1/projects/:projectId/runs/", async ({ request }) => {
            expect(await request.json()).toMatchObject({ document_id: 801 });
            return HttpResponse.json({ ...run, status: "running", stages: { parsing: "running" } });
          }),
          http.get("*/api/ai-estimator/v1/runs/:runId/", () => HttpResponse.json(run)),
          http.post("*/api/ai-estimator/v1/runs/:runId/stories/", async ({ request }) => {
            expect(await request.json()).toMatchObject({
              stories: [{ title: "Reviewed readiness", points: 5 }],
            });
            return HttpResponse.json({
              created: true,
              already_created: false,
              created_count: 1,
              task_ids: [901],
            });
          }),
        ],
      },
    },
  },
} satisfies Meta<typeof AiEstimatorPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EstimateReviewAndImport: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("radio", { name: "Select Release acceptance notes.txt" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(canvas.getByText("Pipeline complete")).toBeVisible(), {
      timeout: 5000,
    });
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    const title = canvas.getByRole("textbox", { name: "Requirement title EP-01" });
    await userEvent.clear(title);
    await userEvent.type(title, "Reviewed readiness");
    await userEvent.click(canvas.getByRole("button", { name: /add stories to project/i }));
    await expect(await canvas.findByText(/Saved 1 work items/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Deep analysis" }));
    await expect(canvas.getByRole("textbox", { name: /epic title EP-01/i })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /add.*story.*release readiness/i }));
    await expect(
      await canvas.findByRole("textbox", { name: /story title EP-01-2/i }),
    ).toBeVisible();
  },
};
