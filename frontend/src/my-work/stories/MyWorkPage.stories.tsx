import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { dataScope } from "../../common/api/queryApi";
import { mockUser } from "../../mocks/users";
import MyWorkPage from "../MyWorkPage";

const meta = {
  title: "My Work/Pages/MyWorkPage",
  component: MyWorkPage,
  tags: ["autodocs"],
  parameters: { route: "/my-work" },
} satisfies Meta<typeof MyWorkPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  async play({ canvas, userEvent }) {
    await canvas.findByRole("button", { name: "Add passkey sign-in" });
    const search = canvas.getByRole("searchbox", { name: "Search my tasks" });
    await userEvent.type(search, "no matching assignment");
    await expect(canvas.getByText("No tasks match your search.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "1 Open assignments" }));
    await expect(search).toHaveValue("");
    await expect(canvas.getByRole("button", { name: "Add passkey sign-in" })).toBeVisible();
    const tasks = within(
      canvas.getByRole("region", { name: "Assigned tasks table" }).closest("section")!,
    );
    await userEvent.click(tasks.getByRole("button", { name: "View all →" }));
    await expect(canvas.getByRole("link", { name: "My Tasks" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};
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
  async play({ canvas }) {
    await expect(
      await canvas.findByRole("button", { name: "Download Release acceptance notes.txt" }),
    ).toBeVisible();
    await expect(canvas.getByRole("link", { name: /Manage private files/ })).toHaveAttribute(
      "href",
      "/documents?location=personal",
    );
  },
};

export const TaskActions: Story = {
  parameters: { route: "/my-work?view=tasks" },
  async play({ canvas, userEvent }) {
    await canvas.findByRole("button", { name: "Add passkey sign-in" });
    await userEvent.click(canvas.getByRole("button", { name: "Blocked 0" }));
    await expect(canvas.getByText("No tasks in this view.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open 1" }));
    await userEvent.click(canvas.getByRole("button", { name: "Add passkey sign-in" }));
    const editor = within(await canvas.findByRole("dialog", { name: "Edit my task" }));
    await userEvent.clear(editor.getByLabelText("Title"));
    await userEvent.type(editor.getByLabelText("Title"), "Review passkey sign-in");
    await userEvent.click(editor.getByRole("button", { name: "Save changes" }));
    await expect(
      await canvas.findByRole("button", { name: "Review passkey sign-in" }),
    ).toBeVisible();
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(
      canvas.getByRole("button", { name: "Mark Review passkey sign-in complete" }),
    );
    await expect(await canvas.findByText("No open tasks assigned to you.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Completed 1" }));
    await expect(canvas.getByRole("button", { name: "Add passkey sign-in" })).toBeVisible();
  },
};

export const CreateTask: Story = {
  parameters: { route: "/my-work?view=tasks" },
  async play({ canvas, userEvent }) {
    await canvas.findByRole("button", { name: "Add passkey sign-in" });
    await userEvent.click(canvas.getByRole("button", { name: "Create task" }));
    const editor = within(await canvas.findByRole("dialog", { name: "Create my task" }));
    await userEvent.type(editor.getByLabelText("Title"), "Prepare my release notes");
    await userEvent.type(editor.getByLabelText("Description"), "Review acceptance criteria.");
    await userEvent.selectOptions(editor.getByLabelText("Priority"), "high");
    await userEvent.click(editor.getByRole("button", { name: "Create task" }));
    await expect(
      await canvas.findByRole("button", { name: "Prepare my release notes" }),
    ).toBeVisible();
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const CalendarNavigation: Story = {
  parameters: { route: "/my-work?view=calendar" },
  async play({ canvas, userEvent }) {
    const week = within(await canvas.findByLabelText("Days in this week"));
    await expect(week.getAllByRole("button")).toHaveLength(7);
    await userEvent.click(week.getAllByRole("button")[2]);
    await expect(week.getAllByRole("button")[2]).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Next week" }));
    await expect(week.getAllByRole("button")[0]).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Previous week" }));
    await userEvent.click(canvas.getByRole("button", { name: "Today" }));
    await expect(week.getAllByRole("button")[0]).toHaveAttribute("aria-pressed", "true");
  },
};

export const TimeLogging: Story = {
  parameters: { route: "/my-work?view=time" },
  beforeEach() {
    const key = `taskflow:my-time:${dataScope().organizationId}:${mockUser.id}`;
    const previous = localStorage.getItem(key);
    localStorage.removeItem(key);
    return () => {
      if (previous === null) localStorage.removeItem(key);
      else localStorage.setItem(key, previous);
    };
  },
  async play({ canvas, userEvent }) {
    await userEvent.click(await canvas.findByRole("button", { name: "Log time" }));
    const form = within(await canvas.findByRole("dialog", { name: "Log my time" }));
    await userEvent.type(form.getByLabelText("Minutes"), "90");
    await userEvent.type(form.getByLabelText("Note"), "Release planning");
    await userEvent.click(form.getByRole("button", { name: "Save time" }));
    await expect(await canvas.findByText("Release planning", { exact: true })).toBeVisible();
    await expect(canvas.getByLabelText("1h 30m logged this week")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /^Remove Task work time/ }));
    await expect(canvas.getByText("Log time to start your personal record.")).toBeVisible();
    await expect(canvas.getByLabelText("0h logged this week")).toBeVisible();
  },
};
