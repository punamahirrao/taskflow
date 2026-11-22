import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { http, HttpResponse } from "msw";
import DependenciesPage from "../DependenciesPage";
import { ProjectContext } from "../../common/features/projects/context/ProjectContext";
import { mockProjects } from "../../mocks/projects";
import { mockTasks } from "../../mocks/tasks";
import type { Task } from "../../features/tasks/entities/task";

let tasks: Task[] = [];
const meta = {
  title: "Planning/Pages/Dependencies",
  component: DependenciesPage,
  beforeEach: () => {
    tasks = mockTasks.map((task) => ({
      ...task,
      blocked_by: task.id === 401 ? [405] : task.id === 402 ? [401] : [],
    }));
  },
  parameters: {
    route: "/planning/dependencies",
    msw: {
      handlers: {
        tasks: [
          http.get("*/tasks/", () => HttpResponse.json(tasks)),
          http.patch("*/tasks/:id/", async ({ params, request }) => {
            const input = (await request.json()) as Partial<Task>;
            tasks = tasks.map((task) =>
              task.id === Number(params.id) ? { ...task, ...input } : task,
            );
            return HttpResponse.json(tasks.find((task) => task.id === Number(params.id)));
          }),
        ],
      },
    },
  },
} satisfies Meta<typeof DependenciesPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CreateAndRemove: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Create dependency" })).toBeEnabled(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Create dependency" }));
    const form = within(canvas.getByRole("dialog"));
    await userEvent.selectOptions(form.getByLabelText("Work item"), "401");
    await expect(form.queryByRole("checkbox", { name: /NEX-401/ })).not.toBeInTheDocument();
    await expect(form.getByRole("checkbox", { name: /NEX-402/ })).toBeDisabled();
    await expect(form.getByRole("checkbox", { name: /NEX-405/ })).toBeChecked();
    await expect(form.getByRole("checkbox", { name: /NEX-405/ })).toBeDisabled();
    await userEvent.click(form.getByRole("checkbox", { name: /NEX-403/ }));
    await userEvent.click(form.getByRole("button", { name: "Create dependency" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    const remove = await canvas.findByRole("button", {
      name: "Remove dependency from NEX-401 to NEX-403",
    });
    await expect(tasks.find((task) => task.id === 401)?.blocked_by).toEqual([405, 403]);
    await userEvent.click(remove);
    await waitFor(() =>
      expect(
        canvas.queryByRole("button", { name: "Remove dependency from NEX-401 to NEX-403" }),
      ).not.toBeInTheDocument(),
    );
    await expect(tasks.find((task) => task.id === 401)?.blocked_by).toEqual([405]);
  },
};

export const Viewer: Story = {
  render: () => (
    <ProjectContext.Provider
      value={{
        projects: mockProjects.map((project) => ({ ...project, my_role: "viewer" })),
        selectedId: 101,
        loading: false,
        error: "",
        select: () => undefined,
        setDefault: async () => undefined,
        reload: async () => undefined,
      }}
    >
      <DependenciesPage />
    </ProjectContext.Provider>
  ),
  play: async ({ canvas }) => {
    await expect((await canvas.findAllByText(/Depends on/))[0]).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Create dependency" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: /Remove dependency/ }),
    ).not.toBeInTheDocument();
  },
};
