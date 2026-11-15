import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { ProjectContext } from "../common/features/projects/context/ProjectContext";
import { mockBoards } from "../mocks/boards";
import { mockProject, mockProjects } from "../mocks/projects";
import BoardDashboardPage from "./BoardDashboardPage";

const meta = {
  title: "Boards/Pages/BoardsPage",
  component: BoardDashboardPage,
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Project board directory with search, filters, board management actions, and creation dialog. Page data is served by MSW fixtures." } } },
} satisfies Meta<typeof BoardDashboardPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const withProjects = (projects: typeof mockProjects, selectedId: number | null) => (StoryComponent: typeof BoardDashboardPage) =>
  <ProjectContext.Provider value={{ projects, selectedId, loading: false, error: "", reload: async () => undefined, select: () => undefined, setDefault: async () => undefined }}><StoryComponent /></ProjectContext.Provider>;

export const StandardWorkspace: Story = {};
export const EmptyWorkspace: Story = {
  decorators: [withProjects([], null)],
  parameters: { msw: { handlers: { boards: [http.get("*/tasks/boards/", () => HttpResponse.json([]))] } } },
};
export const LargeEnterpriseWorkspace: Story = {
  decorators: [withProjects(Array.from({ length: 12 }, (_, index) => ({ ...mockProject, id: 100 + index, name: `Program ${String(index + 1).padStart(2, "0")}` })), 101)],
  parameters: {
    msw: {
      handlers: {
        boards: [http.get("*/tasks/boards/", () => {
          const enterpriseBoards = Array.from({ length: 18 }, (_, index) => ({
            ...mockBoards[index % mockBoards.length],
            id: 200 + index,
            name: `Delivery Team ${String(index + 1).padStart(2, "0")}`,
            project: 101 + index % 12,
          }));
          return HttpResponse.json(enterpriseBoards);
        })],
      },
    },
  },
};
