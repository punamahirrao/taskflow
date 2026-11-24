import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { AgileBoard } from "../../features/tasks/entities/task";
import { ProjectContext } from "../../common/features/projects/context/ProjectContext";
import { mockBoards } from "../../mocks/boards";
import { mockProject, mockProjects } from "../../mocks/projects";
import BoardsDirectoryPage from "../BoardsDirectoryPage";

const meta = {
  title: "Boards/Pages/BoardsDirectoryPage",
  component: BoardsDirectoryPage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Project board directory with search, filters, board management actions, and creation dialog. Page data is served by MSW fixtures.",
      },
    },
  },
} satisfies Meta<typeof BoardsDirectoryPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const withProjects =
  (projects: typeof mockProjects, selectedId: number | null) =>
  (StoryComponent: typeof BoardsDirectoryPage) => (
    <ProjectContext.Provider
      value={{
        projects,
        selectedId,
        loading: false,
        error: "",
        reload: async () => undefined,
        select: () => undefined,
        setDefault: async () => undefined,
      }}
    >
      <StoryComponent />
    </ProjectContext.Provider>
  );

export const StandardOrganization: Story = {};
let managedBoards: AgileBoard[] = [];
export const ManageBoards: Story = {
  beforeEach: () => {
    managedBoards = structuredClone(mockBoards);
  },
  parameters: {
    msw: {
      handlers: {
        boards: [
          http.get("*/tasks/boards/", ({ request }) => {
            const archived = new URL(request.url).searchParams.get("archived") === "true";
            return HttpResponse.json(
              managedBoards.filter((board) => board.is_archived === archived),
            );
          }),
          http.post("*/tasks/projects/:projectId/boards/", async ({ request }) => {
            const board = { ...mockBoards[0], ...((await request.json()) as object), id: 203 };
            managedBoards.push(board);
            return HttpResponse.json(board, { status: 201 });
          }),
          http.patch(
            "*/tasks/projects/:projectId/boards/:boardId/",
            async ({ request, params }) => {
              const board = managedBoards.find((item) => item.id === Number(params.boardId))!;
              Object.assign(board, await request.json());
              return HttpResponse.json(board);
            },
          ),
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("Product Development");
    const search = canvas.getByRole("searchbox");
    await userEvent.type(search, "Release Kanban");
    await expect(canvas.queryByText("Product Development")).not.toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.click(canvas.getByRole("button", { name: /^create board$/i }));
    await userEvent.type(canvas.getByRole("textbox", { name: /board name/i }), "Customer Delivery");
    await userEvent.click(canvas.getByRole("button", { name: /^save$/i }));
    await canvas.findByText("Customer Delivery", { selector: "span" });
    await userEvent.click(
      canvas.getByRole("button", {
        name: /Customer Delivery.*options|options.*Customer Delivery/i,
      }),
    );
    await userEvent.click(canvas.getByRole("button", { name: /edit board/i }));
    const name = canvas.getByRole("textbox", { name: /board name/i });
    await userEvent.clear(name);
    await userEvent.type(name, "Customer Launch");
    await userEvent.click(canvas.getByRole("button", { name: /^save$/i }));
    await canvas.findByText("Customer Launch", { selector: "span" });
    await userEvent.click(
      canvas.getByRole("button", { name: /Customer Launch.*options|options.*Customer Launch/i }),
    );
    await userEvent.click(canvas.getByRole("button", { name: /archive board/i }));
    await waitFor(() =>
      expect(canvas.queryByText("Customer Launch", { selector: "span" })).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole("button", { name: /archived/i }));
    await canvas.findByText("Customer Launch", { selector: "span" });
  },
};
export const EmptyOrganization: Story = {
  decorators: [withProjects([], null)],
  parameters: {
    msw: { handlers: { boards: [http.get("*/tasks/boards/", () => HttpResponse.json([]))] } },
  },
};
export const LargeEnterpriseOrganization: Story = {
  decorators: [
    withProjects(
      Array.from({ length: 12 }, (_, index) => ({
        ...mockProject,
        id: 100 + index,
        name: `Program ${String(index + 1).padStart(2, "0")}`,
      })),
      101,
    ),
  ],
  parameters: {
    msw: {
      handlers: {
        boards: [
          http.get("*/tasks/boards/", () => {
            const enterpriseBoards = Array.from({ length: 18 }, (_, index) => ({
              ...mockBoards[index % mockBoards.length],
              id: 200 + index,
              name: `Delivery Team ${String(index + 1).padStart(2, "0")}`,
              project: 101 + (index % 12),
            }));
            return HttpResponse.json(enterpriseBoards);
          }),
        ],
      },
    },
  },
};
