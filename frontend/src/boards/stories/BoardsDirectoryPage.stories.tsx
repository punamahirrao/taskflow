import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
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
