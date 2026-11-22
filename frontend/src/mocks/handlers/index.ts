import { boardHandlers } from "./boards";
import { projectHandlers } from "./projects";
import { sprintHandlers } from "./sprints";
import { taskHandlers } from "./tasks";
import { userHandlers } from "./users";
import { dashboardHandlers } from "./dashboard";
import { documentHandlers } from "./documents";
import { organizationHandlers } from "./organizations";
import { registrationHandlers } from "./registration";
import { releaseHandlers } from "./releases";

export const handlers = {
  boards: boardHandlers,
  projects: projectHandlers,
  sprints: sprintHandlers,
  tasks: taskHandlers,
  users: userHandlers,
  dashboard: dashboardHandlers,
  documents: documentHandlers,
  organizations: organizationHandlers,
  registration: registrationHandlers,
  releases: releaseHandlers,
};
