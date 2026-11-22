import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { http, HttpResponse } from "msw";
import { mockUser } from "../../../mocks/users";
import TopBar from "../TopBar";
import { AppShellStyles } from "../AppShell.styles";
import { OrganizationContext } from "../../../organizations/context/OrganizationContext";
import { NavigationContext } from "../../features/navigation/NavigationContext";

const meta = {
  title: "Shell/TopBar",
  component: TopBar,
  parameters: {
    msw: {
      handlers: { headerProfile: http.get("*/accounts/me/", () => HttpResponse.json(mockUser)) },
    },
  },
  decorators: [
    (Story) => (
      <OrganizationContext.Provider
        value={{
          organizations: [],
          activeOrganization: null,
          limit: 3,
          switching: false,
          reload: async () => undefined,
          switchOrganization: async () => undefined,
        }}
      >
        <NavigationContext.Provider
          value={{
            overrides: {},
            loading: false,
            error: "",
            save: async () => undefined,
            reload: async () => undefined,
          }}
        >
          <AppShellStyles />
          <div className="app-shell" style={{ display: "block" }}>
            <Story />
          </div>
        </NavigationContext.Provider>
      </OrganizationContext.Provider>
    ),
  ],
} satisfies Meta<typeof TopBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NavyHeader: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.keyboard("/");
    await expect(canvas.getByRole("searchbox", { name: "Search Taskflow" })).toHaveFocus();
    await userEvent.type(canvas.getByRole("searchbox"), "Backlog");
    await expect(await canvas.findByRole("link", { name: "Backlog" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("link", { name: "Backlog" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Switch to night theme" }));
    await expect(document.documentElement).toHaveAttribute("data-theme", "night");
    await userEvent.click(canvas.getByRole("button", { name: "Switch to light theme" }));
    await expect(document.documentElement).toHaveAttribute("data-theme", "professional");
  },
};
export const DarkMode: Story = { globals: { theme: "night" } };
