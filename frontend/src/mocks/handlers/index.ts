import { boardHandlers } from "./boards";
import { projectHandlers } from "./projects";
import { sprintHandlers } from "./sprints";
import { taskHandlers } from "./tasks";
import { userHandlers } from "./users";

export const handlers = { boards: boardHandlers, projects: projectHandlers, sprints: sprintHandlers, tasks: taskHandlers, users: userHandlers };
