import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import DocumentsPage from "../DocumentsPage";

const meta = {
  title: "Documents/Pages/DocumentsPage",
  component: DocumentsPage,
  parameters: { route: "/documents" },
} satisfies Meta<typeof DocumentsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SearchAndPrivateFiles: Story = {
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText("Release acceptance notes.txt");
    const search = canvas.getByRole("textbox", { name: /search documents/i });
    await userEvent.type(search, "unmatched document");
    await expect(canvas.queryByText("Release acceptance notes.txt")).not.toBeInTheDocument();
    await userEvent.clear(search);
    await canvas.findByText("Release acceptance notes.txt");
    const personal = canvas.getByRole("button", { name: /my files.*private/i });
    await userEvent.click(personal);
    await expect(personal).toHaveAttribute("aria-pressed", "true");
    await canvas.findByText("Release acceptance notes.txt");
  },
};
