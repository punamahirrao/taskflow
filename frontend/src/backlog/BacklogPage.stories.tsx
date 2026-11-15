import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import BacklogPage from "./BacklogPage";

const meta = {
  title: "Backlog/Pages/BacklogPage",
  component: BacklogPage,
  tags: ["autodocs"],
  parameters: { docs: { description: { component: "Backlog planning screen with task health metrics, sprint planning, search, and work item actions. All network requests are intercepted by MSW." } } },
} satisfies Meta<typeof BacklogPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StandardBacklog: Story = {};
export const EmptyBacklog: Story = { parameters: { msw: { handlers: { tasks: [http.get("*/tasks/", () => HttpResponse.json([]))], sprints: [http.get("*/tasks/sprints/", () => HttpResponse.json([]))] } } } };
export const DarkMode: Story = { globals: { theme: "night" } };
