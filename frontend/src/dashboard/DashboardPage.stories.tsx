import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectContext } from "../common/features/projects/context/ProjectContext";
import { mockProject, mockProjects } from "../mocks/projects";
import DashboardPage from "./DashboardPage";

const meta = {
  title: "Dashboard/Pages/DashboardPage",
  component: DashboardPage,
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Workspace dashboard with live project task summaries and project activity. Task requests are fulfilled by MSW, so no API server is required." } } },
} satisfies Meta<typeof DashboardPage>;
export default meta;
type Story = StoryObj<typeof meta>;
const withProjects = (projects: typeof mockProjects, selectedId: number | null) => (StoryComponent: typeof DashboardPage) =>
  <ProjectContext.Provider value={{ projects, selectedId, loading: false, error: "", reload: async () => undefined, select: () => undefined, setDefault: async () => undefined }}><StoryComponent /></ProjectContext.Provider>;
export const PersonalWorkspace: Story = {};
export const NoProjects: Story = { decorators: [withProjects([], null)] };
export const EnterprisePortfolio: Story = { decorators: [withProjects(Array.from({ length: 12 }, (_, index) => ({ ...mockProject, id: 100 + index, name: `Portfolio ${index + 1}` })), null)] };
export const DarkMode: Story = { globals: { theme: "night" } };
