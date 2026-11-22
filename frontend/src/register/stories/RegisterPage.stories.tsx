import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import RegisterPage from "../RegisterPage";

const meta = {
  title: "Registration/Pages/RegisterPage",
  component: RegisterPage,
  tags: ["autodocs"],
  parameters: { anonymous: true, route: "/register" },
} satisfies Meta<typeof RegisterPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CreatesOrganization: Story = {
  async play({ canvas, userEvent }) {
    const password = "Storybook-Only-21!";
    const org = canvas.getByTestId("register-organization-name");
    await expect(org).toBeRequired();
    await userEvent.type(canvas.getByTestId("register-email"), "new.owner@example.test");
    await userEvent.type(canvas.getByTestId("register-job-title"), "Delivery lead");
    await userEvent.type(org, "Atlas Demo Institute");
    await userEvent.type(canvas.getByTestId("register-password"), password);
    await userEvent.type(canvas.getByTestId("register-confirm-password"), password);
    await userEvent.click(canvas.getByTestId("register-submit"));
    await expect(await canvas.findByText("Account created. You can sign in now.")).toBeVisible();
  },
};
