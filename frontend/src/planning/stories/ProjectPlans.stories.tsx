import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import OrganizationSectionPage from "../../common/components/OrganizationSectionPage";

const meta = {
  title: "Planning/Pages/ProjectPlans",
  component: OrganizationSectionPage,
  parameters: { route: "/planning/project-plans" },
} satisfies Meta<typeof OrganizationSectionPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ProjectNavigation: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Project Plans" })).toBeVisible();
    const project = await canvas.findByRole("link", { name: /Atlas Customer Platform/i });
    await expect(project).toHaveAttribute("href", "/project/101");
  },
};
