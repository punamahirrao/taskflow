import type { ApprovalStep, Release, ReleaseDirectory } from "../../releases/entities/release";
import { mockProject } from "../projects";
import { mockTasks } from "../tasks";
import { mockUser, mockUsers } from "../users";

const goal = { id: 901, name: "Make account recovery easier", status: "in_progress" };
const active: ApprovalStep = {
  id: 701,
  name: "Product acceptance",
  approver_id: mockUser.id,
  approver_name: "Avery Morgan",
  status: "in_progress",
  note: "",
  decided_at: null,
  can_decide: true,
};
const release: Release = {
  id: 601,
  name: "Atlas account recovery 1.2",
  description: "Release email, passkey, and recovery changes with signed-off acceptance checks.",
  target_date: "2026-11-26",
  state: "in_progress",
  active_step_id: active.id,
  goals: [goal],
  tasks: [mockTasks[1], mockTasks[3], mockTasks[4]].map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    project_id: task.project,
    project_name: mockProject.name,
  })),
  steps: [active],
};
const archived: Release = {
  ...release,
  id: 602,
  name: "Atlas onboarding 1.1",
  description: "Completed the first onboarding improvements.",
  target_date: "2026-11-13",
  state: "done",
  active_step_id: null,
  tasks: release.tasks.filter((task) => task.status === "done"),
  steps: [
    {
      ...active,
      id: 702,
      status: "approved",
      can_decide: false,
      decided_at: "2026-11-12T12:00:00Z",
    },
  ],
};
const draft: Release = {
  ...release,
  id: 603,
  name: "Atlas identity improvements 1.3",
  description: "Plan the next improvements to identity and recovery.",
  target_date: "2026-12-10",
  state: "planned",
  active_step_id: null,
  steps: [],
};

export const mockReleaseDirectory: ReleaseDirectory = {
  items: [release, archived, draft],
  can_manage: true,
  members: mockUsers.map(({ id, first_name, last_name }) => ({
    id,
    name: first_name + " " + last_name,
  })),
  goals: [goal],
};
