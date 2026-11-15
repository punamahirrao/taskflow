import type { Meta, StoryObj } from "@storybook/react-vite";
import type { FormEvent } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { mockProject, mockProjects } from "../../mocks/projects";
import { BoardForm, type BoardFormValues } from "./BoardForm";

const initialValues: BoardFormValues = { name: "", description: "", project: String(mockProject.id), type: "scrum", members: [] };
const submitSpy = fn();
const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submitSpy(event); };
const meta = {
  title: "Boards/Features/CreateBoard",
  component: BoardForm,
  tags: ["autodocs"],
  args: { projects: mockProjects, values: initialValues, editing: null, busy: false, error: "", onChange: fn(), onSubmit: handleSubmit, onCancel: fn() },
  parameters: { docs: { description: { component: "Create or edit a project board. The form is presentation-only; the containing page owns validation, API requests, and submit state. Inputs have visible labels and support keyboard interaction." } } },
} satisfies Meta<typeof BoardForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DialogOpen: Story = {};
export const ValidationError: Story = { args: { error: "Enter a board name before saving." } };
export const Saving: Story = { args: { values: { ...initialValues, name: "Product Development" }, busy: true } };
export const SuccessfulSubmission: Story = {
  args: { values: { ...initialValues, name: "Product Development" } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /save/i }));
    await expect(submitSpy).toHaveBeenCalledOnce();
  },
};
