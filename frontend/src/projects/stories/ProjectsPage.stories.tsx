import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { http, HttpResponse } from "msw";
import ProjectsPage from "../ProjectsPage";
import { ProjectContext } from "../../common/features/projects/context/ProjectContext";
import { useProjectContext } from "../../common/features/projects/context/useProjectContext";

function InteractiveProjectScope({ children }: { children: ReactNode }) {
  const context = useProjectContext();
  const [projects, setProjects] = useState(context.projects);
  return (
    <ProjectContext.Provider
      value={{
        ...context,
        projects,
        setDefault: async (id) => {
          setProjects((current) =>
            current.map((project) => ({ ...project, is_default: project.id === id })),
          );
        },
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

const meta = {
  title: "Projects/Pages/ProjectsPage",
  component: ProjectsPage,
  parameters: { route: "/projects" },
} satisfies Meta<typeof ProjectsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Directory: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByRole("heading", { name: "Assigned to you 2" })).toBeVisible();
    const others = within(canvas.getByRole("region", { name: /Other organization projects/ }));
    await expect(
      await others.findByRole("heading", { name: "Organization Discovery Demo" }),
    ).toBeVisible();
    await expect(others.getByText("Jordan Lee")).toBeVisible();
    await expect(canvas.queryByText("DISCOVER YOUR ORGANIZATION")).not.toBeInTheDocument();
    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "Filter projects by status" }),
      "upcoming",
    );
    await expect(
      canvas.queryByRole("button", { name: "Open Atlas Customer Platform" }),
    ).not.toBeInTheDocument();
    await expect(
      others.getByRole("heading", { name: "Organization Discovery Demo" }),
    ).toBeVisible();
    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "Filter projects by status" }),
      "all",
    );
    await userEvent.type(canvas.getByRole("searchbox"), "No matching project");
    await expect(await others.findByText("No other projects match your search.")).toBeVisible();
    await userEvent.clear(canvas.getByRole("searchbox"));
    await expect(
      await others.findByRole("heading", { name: "Organization Discovery Demo" }),
    ).toBeVisible();
  },
};

export const CreateProject: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "+ Create" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Create new project" }));
    await userEvent.click(dialog.getByRole("button", { name: "Create" }));
    await expect(dialog.getByText("Project name is required")).toBeVisible();
    await userEvent.type(dialog.getByLabelText("Project name"), "Release planning");
    await userEvent.type(dialog.getByLabelText("Description"), "Prepare the next release.");
    await userEvent.selectOptions(dialog.getByLabelText("Project status"), "upcoming");
    await userEvent.click(dialog.getByRole("button", { name: "Create" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const DefaultProject: Story = {
  decorators: [
    (Story) => (
      <InteractiveProjectScope>
        <Story />
      </InteractiveProjectScope>
    ),
  ],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Set Mobile Checkout as default project" }),
    );
    const remove = await canvas.findByRole("button", {
      name: "Remove Mobile Checkout as default project",
    });
    await expect(remove).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("button", { name: "Set Atlas Customer Platform as default project" }),
    ).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(remove);
    await expect(
      await canvas.findByRole("button", { name: "Set Mobile Checkout as default project" }),
    ).toHaveAttribute("aria-pressed", "false");
  },
};

export const RequestAccess: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Request access to Organization Discovery Demo" }),
    );
    const dialog = within(canvas.getByRole("dialog", { name: "Request project access" }));
    await expect(dialog.getByRole("button", { name: "Send request" })).toBeDisabled();
    await userEvent.selectOptions(dialog.getByLabelText("Access level"), "viewer");
    await userEvent.type(
      dialog.getByLabelText("Why do you need access?"),
      "I need to review the upcoming launch plan.",
    );
    await userEvent.click(dialog.getByRole("button", { name: "Send request" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(await canvas.findByText("Request pending")).toBeVisible();
  },
};

export const RequestError: Story = {
  parameters: {
    msw: {
      handlers: {
        requestFailure: [
          http.post("*/projects/:projectId/access-requests/", () =>
            HttpResponse.json(
              { detail: "Unable to send the request. Please retry." },
              { status: 503 },
            ),
          ),
          http.get("*/projects/directory/", () =>
            HttpResponse.json([
              {
                id: 8888,
                name: "Research project",
                description: "Explore new product ideas.",
                status: "in_progress",
                has_access: false,
                owner_details: { id: 2, name: "Jordan Lee" },
              },
            ]),
          ),
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Request access to Research project" }),
    );
    const dialog = within(canvas.getByRole("dialog"));
    await userEvent.type(
      dialog.getByLabelText("Why do you need access?"),
      "Help with product research.",
    );
    await userEvent.click(dialog.getByRole("button", { name: "Send request" }));
    await expect(await dialog.findByRole("alert")).toHaveTextContent(
      "Unable to send the request. Please retry.",
    );
    await expect(dialog.getByRole("button", { name: "Send request" })).toBeEnabled();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const ReviewRequests: Story = {
  parameters: {
    msw: {
      handlers: {
        reviewRequests: [
          http.get("*/projects/access-requests/", () =>
            HttpResponse.json([
              {
                id: 77,
                project_id: 101,
                project_name: "Atlas Customer Platform",
                requester: { id: 2, name: "Jordan Lee" },
                requested_role: "viewer",
                reason: "Review the delivery plan.",
                status: "pending",
                created_at: "2026-11-22T10:00:00Z",
              },
            ]),
          ),
          http.patch("*/projects/access-requests/77/", () =>
            HttpResponse.json({ status: "approved" }),
          ),
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const approve = await canvas.findByRole("button", { name: "Approve Jordan Lee's request" });
    await userEvent.click(approve);
    await waitFor(() =>
      expect(canvas.queryByRole("region", { name: "Access requests 1" })).not.toBeInTheDocument(),
    );
  },
};

export const ManyProjects: Story = {
  parameters: {
    msw: {
      handlers: {
        manyProjects: http.get("*/projects/directory/", () =>
          HttpResponse.json(
            Array.from({ length: 8 }, (_, index) => ({
              id: 9000 + index,
              name: `Organization project ${index + 1}`,
              description: "Work with the organization on a shared delivery milestone.",
              status: "in_progress",
              has_access: index === 0,
              is_assigned: false,
              owner_details: { id: 2, name: "Jordan Lee" },
            })),
          ),
        ),
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const others = within(canvas.getByRole("region", { name: /Other organization projects/ }));
    await others.findByRole("button", { name: "More organization projects" });
    await expect(others.getAllByRole("article")).toHaveLength(6);
    await expect(others.getByRole("button", { name: "Open project" })).toBeVisible();
    await userEvent.click(others.getByRole("button", { name: "More organization projects" }));
    await expect(others.getAllByRole("article")).toHaveLength(8);
  },
};

export const DarkMode: Story = {
  globals: { theme: "night" },
  parameters: {
    msw: {
      handlers: {
        darkDirectory: http.get("*/projects/directory/", () =>
          HttpResponse.json([
            {
              id: 8999,
              name: "Research project",
              description: "Explore new product ideas.",
              status: "in_progress",
              has_access: false,
              owner_details: { id: 2, name: "Jordan Lee" },
            },
          ]),
        ),
      },
    },
  },
};

export const DarkAccessForm: Story = {
  ...DarkMode,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Request access to Research project" }),
    );
    await expect(canvas.getByRole("dialog", { name: "Request project access" })).toBeVisible();
  },
};
