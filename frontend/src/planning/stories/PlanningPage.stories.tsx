import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, within } from "storybook/test";
import PlanningPage from "../PlanningPage";
import type { PlanningRecord } from "../entities/planning";

let records: PlanningRecord[] = [];
const meta = {
  title: "Planning/Pages/Milestones",
  component: PlanningPage,
  args: { kind: "milestone" },
  beforeEach: () => {
    records = [];
  },
  parameters: {
    route: "/planning/milestones",
    msw: {
      handlers: {
        planning: [
          http.get("*/projects/planning/", () =>
            HttpResponse.json({ items: records, can_manage: true }),
          ),
          http.post("*/projects/planning/", async ({ request }) => {
            const values = (await request.json()) as Omit<PlanningRecord, "id">;
            const saved = { ...values, id: 1001 };
            records.push(saved);
            return HttpResponse.json(saved, { status: 201 });
          }),
          http.patch("*/projects/planning/:id/", async ({ params, request }) => {
            const values = (await request.json()) as Partial<PlanningRecord>;
            records = records.map((item) =>
              item.id === Number(params.id) ? { ...item, ...values } : item,
            );
            return HttpResponse.json(records.find((item) => item.id === Number(params.id)));
          }),
        ],
      },
    },
  },
} satisfies Meta<typeof PlanningPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CreateGoal: Story = {
  args: { kind: "goal" },
  parameters: { route: "/goals" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Create goal" }));
    const dialog = within(canvas.getByRole("dialog"));
    await userEvent.type(
      dialog.getByRole("textbox", { name: "Name" }),
      "Improve release confidence",
    );
    await userEvent.click(dialog.getByRole("button", { name: "Create goal" }));
    await expect(
      await canvas.findByRole("cell", { name: "Improve release confidence" }),
    ).toBeVisible();
  },
};

export const CreateAndEditMilestone: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Create milestone" }));
    let form = within(canvas.getByRole("dialog", { name: "Create milestone" }));
    await expect(form.getByRole("button", { name: "Create milestone" })).toBeDisabled();
    await userEvent.type(form.getByLabelText("Name"), "Beta launch readiness");
    await userEvent.type(form.getByLabelText("Description"), "Complete launch checks.");
    await userEvent.type(form.getByLabelText("Target date"), "2026-12-18");
    await userEvent.click(await form.findByRole("checkbox", { name: /NEX-401/ }));
    await userEvent.click(form.getByRole("button", { name: "Create milestone" }));
    await expect(await canvas.findByText("Beta launch readiness", { exact: true })).toBeVisible();
    await expect(records[0]).toMatchObject({
      kind: "milestone",
      target_date: "2026-12-18",
      tasks: [401],
    });
    await userEvent.click(canvas.getByRole("button", { name: "Edit Beta launch readiness" }));
    form = within(canvas.getByRole("dialog", { name: "Edit milestone" }));
    await userEvent.selectOptions(form.getByLabelText("Status"), "done");
    await userEvent.click(form.getByRole("button", { name: "Save changes" }));
    await expect(await canvas.findByText("done", { exact: true })).toBeVisible();
  },
};

export const SaveFailure: Story = {
  parameters: {
    msw: {
      handlers: {
        planning: [
          http.get("*/projects/planning/", () =>
            HttpResponse.json({ items: [], can_manage: true }),
          ),
          http.post("*/projects/planning/", () =>
            HttpResponse.json(
              { detail: "Milestone could not be saved. Try again." },
              { status: 400 },
            ),
          ),
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Create milestone" }));
    const form = within(canvas.getByRole("dialog"));
    await userEvent.type(form.getByLabelText("Name"), "Beta launch readiness");
    await userEvent.click(form.getByRole("button", { name: "Create milestone" }));
    await expect(await form.findByRole("alert")).toHaveTextContent("Milestone could not be saved");
    await expect(form.getByLabelText("Name")).toHaveValue("Beta launch readiness");
  },
};
