import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, within, waitFor } from "storybook/test";
import { http, HttpResponse } from "msw";
import SprintTrainPage from "../SprintTrainPage";
import TopBar from "../../common/components/TopBar";
import { AppShellStyles } from "../../common/components/AppShell.styles";
import { OrganizationContext } from "../../organizations/context/OrganizationContext";
import { NavigationContext } from "../../common/features/navigation/NavigationContext";
import { mockUser } from "../../mocks/users";
import { mockSprints } from "../../mocks/sprints";
import { mockTasks } from "../../mocks/tasks";
import type { Sprint, Task } from "../../features/tasks/entities/task";
import { capacityPlanningFixture, storyActivityFixture } from "./sprintTrainFixtures";

function planningFixture() {
  let tasks: Task[] = [];
  let sprints: Sprint[] = [];
  function reset() {
    tasks = structuredClone(mockTasks).map((task) => ({
      ...task,
      is_wishlisted: task.id === 403,
    }));
    tasks.push({ ...tasks[2], id: 909, title: "Explore next sprint idea", is_wishlisted: false });
    sprints = structuredClone(mockSprints).map((sprint) => ({
      ...sprint,
      goal: "",
      start_date: null,
      end_date: null,
      can_manage: true,
    }));
  }
  reset();
  return {
    reset,
    handlers: [
      http.get("*/accounts/me/", () => HttpResponse.json(mockUser)),
      http.get("*/tasks/", () => HttpResponse.json(tasks)),
      http.patch("*/tasks/:taskId/", async ({ request, params }) => {
        const patch = (await request.json()) as Partial<Task>;
        const task = tasks.find((item) => item.id === Number(params.taskId));
        if (!task) return new HttpResponse(null, { status: 404 });
        Object.assign(task, patch);
        return HttpResponse.json(task);
      }),
      http.post("*/tasks/", async ({ request }) => {
        const patch = (await request.json()) as Partial<Task> & { project_id: number };
        const task: Task = {
          ...tasks[0],
          ...patch,
          id: 910,
          project: patch.project_id,
          is_wishlisted: false,
        };
        tasks.push(task);
        return HttpResponse.json(task, { status: 201 });
      }),
      http.get("*/tasks/sprints/", () => HttpResponse.json(sprints)),
      http.patch("*/tasks/sprints/:sprintId/", async ({ request, params }) => {
        const patch = (await request.json()) as Partial<Sprint>;
        const sprint = sprints.find((item) => item.id === Number(params.sprintId));
        if (!sprint) return new HttpResponse(null, { status: 404 });
        Object.assign(sprint, patch);
        return HttpResponse.json(sprint);
      }),
    ],
  };
}

const wishlistFixture = planningFixture();
const detailsFixture = planningFixture();
const assignmentFixture = planningFixture();

const meta = {
  title: "Sprint Train/Pages/SprintTrainPage",
  component: SprintTrainPage,
  decorators: [
    (Story) => (
      <OrganizationContext.Provider
        value={{
          organizations: [],
          activeOrganization: null,
          limit: 3,
          switching: false,
          reload: async () => undefined,
          switchOrganization: async () => undefined,
        }}
      >
        <NavigationContext.Provider
          value={{
            overrides: {},
            loading: false,
            error: "",
            save: async () => undefined,
            reload: async () => undefined,
          }}
        >
          <AppShellStyles />
          <div className="app-shell">
            <div className="platform-sidebar shell-sidebar" aria-hidden="true">
              Taskflow
            </div>
            <div className="shell-body">
              <TopBar />
              <div className="shell-content">
                <Story />
              </div>
            </div>
          </div>
        </NavigationContext.Provider>
      </OrganizationContext.Provider>
    ),
  ],
  parameters: {
    msw: {
      handlers: {
        trainLayout: [
          http.get("*/accounts/me/", () => HttpResponse.json(mockUser)),
          http.get("*/tasks/:taskId/comments/", () => HttpResponse.json([])),
          http.get("*/tasks/:taskId/history/", () => HttpResponse.json([])),
          http.get("*/tasks/sprints/", () =>
            HttpResponse.json([
              { ...mockSprints[0], name: "Sprint 1.3: Project Delivery" },
              { ...mockSprints[1], name: "Sprint 1.4: Reporting & Insights" },
              { ...mockSprints[1], id: 303, name: "Sprint 1.5: Polish & Release" },
            ]),
          ),
        ],
      },
    },
  },
} satisfies Meta<typeof SprintTrainPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};
export const StoryDrawer: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("article", { name: /Create release readiness checklist/ }),
    );
    const details = canvas.getByTestId("sprint-story-details");
    const header = canvas.getByRole("searchbox", { name: "Search Taskflow" }).closest("header")!;
    expect(details.getBoundingClientRect().top).toBeCloseTo(
      header.getBoundingClientRect().bottom,
      0,
    );
    expect(details.getBoundingClientRect().right).toBeCloseTo(
      document.documentElement.clientWidth,
      0,
    );
  },
};
export const BacklogDrawer: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Story" }));
    const drawer = await canvas.findByRole("complementary", { name: "Global backlog drawer" });
    const header = canvas.getByRole("searchbox", { name: "Search Taskflow" }).closest("header")!;
    expect(drawer.getBoundingClientRect().top).toBeCloseTo(
      header.getBoundingClientRect().bottom,
      0,
    );
    expect(drawer.getBoundingClientRect().right).toBeCloseTo(
      document.documentElement.clientWidth,
      0,
    );
    const pipeline = canvas.getByRole("region", { name: "Sprint pipeline" });
    expect(pipeline.getBoundingClientRect().right).toBeLessThan(
      drawer.getBoundingClientRect().left,
    );
    const cards = pipeline.querySelectorAll('[role="button"]');
    for (const card of cards) {
      expect(card.getBoundingClientRect().right).toBeLessThanOrEqual(
        pipeline.getBoundingClientRect().right + 1,
      );
      expect(card.getBoundingClientRect().top).toBeCloseTo(cards[0].getBoundingClientRect().top, 0);
    }
    expect(within(drawer).queryByText(/Drag stories onto/)).not.toBeInTheDocument();
    expect(
      within(drawer).queryByText(/Stories and sprint assignments are saved/),
    ).not.toBeInTheDocument();
    expect(within(drawer).queryByText(/Assignee:/)).not.toBeInTheDocument();
    expect(within(drawer).queryByText("To Do")).not.toBeInTheDocument();
    expect(within(drawer).getByRole("img", { name: "Unassigned profile picture" })).toBeVisible();
    expect(canvas.queryByText("Active Selection")).not.toBeInTheDocument();
    const summary = drawer.querySelector(".sprint-backlog-summary")!;
    const boxes = [...summary.children];
    for (const box of boxes) {
      expect(box.getBoundingClientRect().top).toBeCloseTo(boxes[0].getBoundingClientRect().top, 0);
      expect(box.getBoundingClientRect().width).toBeCloseTo(
        boxes[0].getBoundingClientRect().width,
        0,
      );
    }
    expect(within(boxes[0] as HTMLElement).getByText("18 pts")).toBeVisible();
    await userEvent.click(cards[1] as HTMLElement);
    expect(within(boxes[0] as HTMLElement).getByText("0 pts")).toBeVisible();
    await userEvent.click(within(drawer).getByRole("button", { name: "Add Story" }));
    await expect(within(drawer).getByLabelText("Title")).toBeVisible();
    await userEvent.click(within(drawer).getByRole("button", { name: "Cancel" }));
  },
};
export const AssignedBacklogStory: Story = {
  parameters: {
    msw: {
      handlers: {
        assignedBacklog: http.get("*/tasks/", () =>
          HttpResponse.json(
            mockTasks.map((task) =>
              task.status === "backlog"
                ? {
                    ...task,
                    assignee: 2,
                    assignee_name: "Jordan Lee",
                    work_type: "story",
                    tags: ["roadmap", "Auth"],
                  }
                : task,
            ),
          ),
        ),
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Story" }));
    const drawer = await canvas.findByRole("complementary", { name: "Global backlog drawer" });
    const photo = await within(drawer).findByRole("img", { name: "Jordan Lee profile picture" });
    expect(photo.closest(".sprint-backlog-card-points")).not.toBeNull();
    expect(within(drawer).getByText("story")).toBeVisible();
    expect(within(drawer).getByText("Auth")).toBeVisible();
    expect(within(drawer).queryByText(/Assignee:/)).not.toBeInTheDocument();
  },
};
export const BothDrawers: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Story" }));
    const backlog = await canvas.findByRole("complementary", { name: "Global backlog drawer" });
    await userEvent.click(
      await canvas.findByRole("article", { name: "Open details for Review onboarding analytics" }),
    );
    const details = canvas.getByTestId("sprint-story-details");
    expect(details.getBoundingClientRect().top).toBeCloseTo(backlog.getBoundingClientRect().top, 0);
    expect(details.getBoundingClientRect().bottom).toBeCloseTo(
      backlog.getBoundingClientRect().bottom,
      0,
    );
    expect(details.getBoundingClientRect().right).toBeCloseTo(
      backlog.getBoundingClientRect().left,
      0,
    );
  },
};

export const WishList: Story = {
  beforeEach: wishlistFixture.reset,
  parameters: { msw: { handlers: { trainLayout: wishlistFixture.handlers } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Story" }));
    const drawer = within(
      await canvas.findByRole("complementary", { name: "Global backlog drawer" }),
    );
    await expect(await drawer.findByText("2 Items")).toBeVisible();
    await userEvent.click(drawer.getByRole("button", { name: /^Wish list/ }));
    await expect(drawer.getByText("1 Item")).toBeVisible();
    await expect(drawer.queryByText("Explore next sprint idea")).not.toBeInTheDocument();
    await expect(drawer.getByRole("button", { name: /^All items/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(drawer.getByRole("button", { name: /^All items/ }));
    await userEvent.click(
      drawer.getByRole("button", { name: "Add to wish list: Explore next sprint idea" }),
    );
    await waitFor(() =>
      expect(
        drawer.getByRole("button", { name: "Remove from wish list: Explore next sprint idea" }),
      ).toBeEnabled(),
    );
    await expect(canvas.queryByTestId("sprint-story-details")).not.toBeInTheDocument();
    await userEvent.click(drawer.getByRole("button", { name: /^Wish list/ }));
    await expect(drawer.getByText("2 Items")).toBeVisible();
    await userEvent.click(
      drawer.getByRole("button", { name: "Remove from wish list: Review onboarding analytics" }),
    );
    await waitFor(() => expect(drawer.getByText("1 Item")).toBeVisible());
    await expect(drawer.queryByText("Review onboarding analytics")).not.toBeInTheDocument();
    await expect(drawer.getByText("Explore next sprint idea")).toBeVisible();
  },
};

export const EditableSprintGoalAndDates: Story = {
  beforeEach: detailsFixture.reset,
  parameters: { msw: { handlers: { trainLayout: detailsFixture.handlers } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Add sprint goal" }));
    await userEvent.type(canvas.getByLabelText("Sprint goal"), "Ship the new planning flow");
    await fireEvent.change(canvas.getByLabelText("Start date"), {
      target: { value: "2026-12-01" },
    });
    await fireEvent.change(canvas.getByLabelText("End date"), { target: { value: "2026-12-14" } });
    await userEvent.click(canvas.getByRole("button", { name: "Save sprint details" }));
    await expect(
      await canvas.findByRole("button", { name: "Edit sprint goal: Ship the new planning flow" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Edit sprint dates:/ }));
    await expect(canvas.getByLabelText("Start date")).toHaveValue("2026-12-01");
    await expect(canvas.getByLabelText("End date")).toHaveValue("2026-12-14");
    await userEvent.clear(canvas.getByLabelText("Sprint goal"));
    await userEvent.click(canvas.getByRole("button", { name: "Save sprint details" }));
    await expect(await canvas.findByRole("button", { name: "Add sprint goal" })).toBeVisible();
    await expect(canvas.queryByText(/Inline list view/)).not.toBeInTheDocument();
  },
};

export const SilentStoryAssignment: Story = {
  beforeEach: assignmentFixture.reset,
  parameters: { msw: { handlers: { trainLayout: assignmentFixture.handlers } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Story" }));
    const drawer = within(
      await canvas.findByRole("complementary", { name: "Global backlog drawer" }),
    );
    const source = await drawer.findByRole("article", {
      name: "Open details for Review onboarding analytics",
    });
    const target = canvas
      .getByRole("region", { name: "Sprint pipeline" })
      .querySelector('[role="button"]')!;
    const dataTransfer = new DataTransfer();
    source.dispatchEvent(
      new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }),
    );
    await expect(dataTransfer.getData("text/plain")).toBe("403");
    target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
    await waitFor(() =>
      expect(drawer.queryByText("Review onboarding analytics")).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText("Review onboarding analytics")).toBeVisible();
    await expect(canvas.queryByText(/added to .*Sprint/)).not.toBeInTheDocument();
    await userEvent.click(drawer.getByRole("button", { name: "Add Story" }));
    await userEvent.type(drawer.getByLabelText("Title"), "Validate silent story creation");
    await userEvent.click(drawer.getByRole("button", { name: "Add Story to Sprint" }));
    await expect(await canvas.findByText("Validate silent story creation")).toBeVisible();
    await expect(canvas.queryByText(/added to .*Sprint/)).not.toBeInTheDocument();
  },
};

export const CreateSprint: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Sprint" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Create Sprint" }));
    await userEvent.type(dialog.getByLabelText("Sprint name"), "Sprint UI refactor");
    await fireEvent.change(dialog.getByLabelText("Start date"), {
      target: { value: "2026-12-01" },
    });
    await fireEvent.change(dialog.getByLabelText("End date"), { target: { value: "2026-12-14" } });
    await userEvent.type(dialog.getByLabelText("Capacity (points)"), "24");
    await userEvent.type(dialog.getByLabelText("Sprint goal"), "Finish the planning flow");
    await userEvent.click(dialog.getByRole("button", { name: "Create Sprint" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(
      canvas.getByRole("heading", { name: "Sprint UI refactor — Sprint Stories List" }),
    ).toBeVisible();
  },
};

const activityFixture = storyActivityFixture();
export const StoryCommentsAndHistory: Story = {
  beforeEach: activityFixture.reset,
  parameters: { msw: { handlers: { trainLayout: activityFixture.handlers } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("article", { name: /Create release readiness checklist/ }),
    );
    const drawer = within(canvas.getByTestId("sprint-story-details"));
    await userEvent.click(drawer.getByRole("button", { name: /^comments/ }));
    await expect(await drawer.findByText("Review acceptance steps.")).toBeVisible();
    await userEvent.type(drawer.getByLabelText("Add a comment"), "Ready for review.");
    await userEvent.click(drawer.getByRole("button", { name: "Post comment" }));
    const comment = within(
      (await drawer.findByText("Ready for review.", { selector: "p" })).closest("article")!,
    );
    await userEvent.click(comment.getByRole("button", { name: "Edit comment" }));
    await userEvent.clear(comment.getByRole("textbox"));
    await userEvent.type(comment.getByRole("textbox"), "Reviewed and ready.");
    await userEvent.click(comment.getByRole("button", { name: "Save edit" }));
    await expect(await drawer.findByText("Reviewed and ready.", { selector: "p" })).toBeVisible();
    const previousConfirm = window.confirm;
    try {
      window.confirm = () => true;
      await userEvent.click(comment.getByRole("button", { name: "Delete comment" }));
      await waitFor(() =>
        expect(drawer.queryByText("Reviewed and ready.")).not.toBeInTheDocument(),
      );
    } finally {
      window.confirm = previousConfirm;
    }
    await userEvent.click(drawer.getByRole("button", { name: "history" }));
    await expect(await drawer.findByText(/todo → review/)).toBeVisible();
  },
};

const capacityFixture = capacityPlanningFixture();
export const CapacityPlanning: Story = {
  beforeEach: capacityFixture.reset,
  parameters: { msw: { handlers: { trainLayout: capacityFixture.handlers } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Team Capacity" }));
    const points = await canvas.findByRole("spinbutton", {
      name: "Full-sprint points for Avery Morgan",
    });
    await userEvent.clear(points);
    await userEvent.type(points, "30");
    const allocation = canvas.getByRole("spinbutton", {
      name: "Allocation percent for Avery Morgan",
    });
    await userEvent.clear(allocation);
    await userEvent.type(allocation, "50");
    await userEvent.click(canvas.getByRole("button", { name: "Save team plan" }));
    await expect(await canvas.findByText("Team plan saved.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Use forecast for sprint" }));
    await expect(await canvas.findByText("Sprint capacity set to 15 pts.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Log absence" }));
    const absence = within(canvas.getByRole("form", { name: "Log time off" }));
    await userEvent.selectOptions(absence.getByLabelText("Time off type"), "absence");
    await userEvent.selectOptions(absence.getByLabelText("Duration per day"), "0.5");
    await userEvent.type(absence.getByLabelText("Note (optional)"), "Planning appointment");
    await userEvent.click(absence.getByRole("button", { name: "Save time off" }));
    await expect(await canvas.findByText("Planning appointment")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove absence for Avery Morgan" }));
    await expect(await canvas.findByText("No time off logged for this sprint.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Log holiday" }));
    const holiday = within(canvas.getByRole("form", { name: "Log team holiday" }));
    await userEvent.type(holiday.getByLabelText("Holiday name"), "Planning break");
    await userEvent.click(holiday.getByRole("button", { name: "Save holiday" }));
    await expect(await canvas.findByText("Planning break")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove holiday Planning break" }));
    await expect(await canvas.findByText("No team holidays in this sprint.")).toBeVisible();
  },
};
