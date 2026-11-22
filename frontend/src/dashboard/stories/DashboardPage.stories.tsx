import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import { ProjectContext } from "../../common/features/projects/context/ProjectContext";
import { mockProject, mockProjects } from "../../mocks/projects";
import { mockDelivery } from "../../mocks/handlers/dashboard";
import DashboardPage from "../DashboardPage";

function Scope({
  children,
  projects,
  initial,
}: {
  children: ReactNode;
  projects: typeof mockProjects;
  initial: number | null;
}) {
  const [selectedId, select] = useState(initial);
  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedId,
        loading: false,
        error: "",
        reload: async () => undefined,
        select,
        setDefault: async () => undefined,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

const meta = {
  title: "Dashboard/Pages/DashboardPage",
  component: DashboardPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Project health and delivery trends. Storybook uses simulated API data.",
      },
    },
  },
} satisfies Meta<typeof DashboardPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectView: Story = {};
export const OrganizationView: Story = {
  decorators: [
    (StoryComponent) => (
      <Scope projects={mockProjects} initial={null}>
        <StoryComponent />
      </Scope>
    ),
  ],
  play: async ({ canvas, userEvent }) => {
    await expect(
      await canvas.findByRole("heading", { name: "Delivery needs attention" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Blocked 1" }));
    await expect(canvas.getByRole("button", { name: "Blocked 1" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.selectOptions(canvas.getByLabelText("Delivery period"), "28");
    await expect(canvas.getByLabelText("Delivery period")).toHaveValue("28");
    await userEvent.click(canvas.getByRole("button", { name: "Mobile Checkout" }));
    await expect(
      await canvas.findByRole("heading", { name: "No open risks flagged" }),
    ).toBeVisible();
  },
};

const populatedDelivery = () => {
  const snapshot = mockDelivery();
  snapshot.projects = Array.from({ length: 7 }, (_, index) => ({
    ...snapshot.projects[0],
    id: index + 1,
    name: `Project ${index + 1}`,
    overdue: index === 0 ? 7 : 0,
    blocked: index === 0 ? 7 : 0,
    at_risk: index === 0 ? 7 : 0,
  }));
  const attention = Array.from({ length: 7 }, (_, index) => ({
    ...snapshot.attention.overdue[0],
    id: index + 1,
    title: `Attention item ${index + 1}`,
  }));
  snapshot.attention = { overdue: attention, blocked: attention, due_soon: [] };
  snapshot.sprint_count = 4;
  snapshot.sprints = Array.from({ length: 4 }, (_, index) => ({
    ...snapshot.sprints[0],
    id: index + 1,
    name: `Sprint ${index + 1}`,
  }));
  snapshot.milestones = Array.from({ length: 4 }, (_, index) => ({
    ...snapshot.milestones[0],
    id: index + 1,
    name: `Target ${index + 1}`,
  }));
  return snapshot;
};

export const ManyRecords: Story = {
  parameters: {
    msw: {
      handlers: {
        dashboard: [
          http.get("*/dashboard/delivery/", () => HttpResponse.json(populatedDelivery())),
          http.get("*/dashboard/activity/", () =>
            HttpResponse.json(
              Array.from({ length: 12 }, (_, index) => ({
                id: index + 1,
                task_id: index + 1,
                project_id: 101,
                project_name: "Atlas Customer Platform",
                title: `Work item ${index + 1}`,
                actor: "Storybook User",
                action: "updated",
                created_at: "2026-11-21T10:00:00Z",
              })),
            ),
          ),
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await canvas.findByRole("heading", { name: "Delivery needs attention" });
    const attention = within(canvas.getByRole("region", { name: "Needs attention" }));
    await expect(attention.getAllByRole("listitem")).toHaveLength(4);
    await userEvent.click(attention.getByRole("button", { name: "More attention items" }));
    await expect(attention.getAllByRole("listitem")).toHaveLength(7);
    await userEvent.click(attention.getByRole("button", { name: "Blocked 7" }));
    await expect(attention.getAllByRole("listitem")).toHaveLength(4);
    const projects = within(canvas.getByRole("region", { name: "Project pulse" }));
    await expect(projects.getAllByRole("row")).toHaveLength(6);
    await expect(projects.getByRole("link", { name: "More projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    const sprints = within(canvas.getByRole("region", { name: "Active sprints 4" }));
    await expect(sprints.getAllByRole("listitem")).toHaveLength(3);
    await expect(sprints.getByRole("link", { name: "More active sprints" })).toHaveAttribute(
      "href",
      "/sprint-train",
    );
    const targets = within(canvas.getByRole("region", { name: "Coming up" }));
    await expect(targets.getAllByRole("listitem")).toHaveLength(3);
    await expect(targets.getByRole("link", { name: "More upcoming targets" })).toHaveAttribute(
      "href",
      "/calendar",
    );
    const activity = within(canvas.getByRole("region", { name: "Recent activity" }));
    await activity.findByRole("button", { name: "More recent activity" });
    await expect(activity.getAllByRole("listitem")).toHaveLength(5);
    await userEvent.click(activity.getByRole("button", { name: "More recent activity" }));
    await expect(activity.getAllByRole("listitem")).toHaveLength(10);
    await userEvent.click(activity.getByRole("button", { name: "More recent activity" }));
    await expect(activity.getAllByRole("listitem")).toHaveLength(12);
    await userEvent.click(activity.getByRole("button", { name: "Show less recent activity" }));
    await expect(activity.getAllByRole("listitem")).toHaveLength(5);
  },
};
export const NoProjects: Story = {
  decorators: [
    (StoryComponent) => (
      <Scope projects={[]} initial={null}>
        <StoryComponent />
      </Scope>
    ),
  ],
  parameters: {
    msw: {
      handlers: {
        emptyDelivery: http.get("*/dashboard/delivery/", () =>
          HttpResponse.json(mockDelivery("-1")),
        ),
      },
    },
  },
};
export const DarkMode: Story = {
  globals: { theme: "night" },
  decorators: [
    (StoryComponent) => (
      <Scope projects={mockProjects} initial={mockProject.id}>
        <StoryComponent />
      </Scope>
    ),
  ],
};
