import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { mockProject, mockProjects } from "../../../mocks/projects";
import { QuickCaptureDialog } from "../../features/quick-capture/QuickCaptureDialog";

const meta = {
  title: "Backlog/Features/QuickCapture",
  component: QuickCaptureDialog,
  tags: ["autodocs"],
  args: {
    projects: mockProjects,
    defaultProjectId: mockProject.id,
    onClose: fn(),
    onCreated: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Quickly capture an idea or work item into the selected project backlog. Validation and network responses are mocked for isolated stories.",
      },
    },
  },
} satisfies Meta<typeof QuickCaptureDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DialogOpen: Story = {};
export const NoProjectSelected: Story = { args: { defaultProjectId: null } };
