import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { AppShellStyles } from "../../../common/components/AppShell.styles";
import { SettingsHubStyles } from "../../../settings/SettingsHub.styles";
import OrganizationProvider from "../../context/OrganizationProvider";
import OrganizationSettings from "../OrganizationSettings";

const meta = {
  title: "Organizations/Sections/OrganizationSettings",
  component: OrganizationSettings,
  tags: ["autodocs"],
  parameters: { route: "/settings/organizations" },
  decorators: [
    (Story) => (
      <OrganizationProvider>
        <AppShellStyles />
        <SettingsHubStyles />
        <main className="p-6">
          <Story />
        </main>
      </OrganizationProvider>
    ),
  ],
} satisfies Meta<typeof OrganizationSettings>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TwoOrganizations: Story = {
  async play({ canvas, userEvent }) {
    await expect(await canvas.findByText("Atlas Labs", { exact: true })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Create new organization" })).toBeDisabled();
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search organizations" }),
      "Sandbox",
    );
    await expect(canvas.getByRole("button", { name: "Switch to Atlas Sandbox" })).toBeVisible();
    await expect(canvas.queryByText("Atlas Labs", { exact: true })).toBeNull();
  },
};
