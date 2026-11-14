import { defineLabels } from "./defineLabels";

export const boardsLabels = defineLabels({
  "boards.eyebrow": "Sprint execution", "boards.title": "Boards",
  "boards.subtitle": "Move work through Backlog, To Do, In Progress, Review, Waiting, and Done. Select a card to see its details.",
  "boards.swimlanes": "Swimlanes", "boards.swimlanesAria": "Board swimlanes",
  "boards.laneProject": "Project", "boards.lanePriority": "Priority", "boards.laneAssignee": "Assignee", "boards.laneEpic": "Epic / initiative", "boards.laneSprintGoal": "Sprint goal",
  "boards.activeSprintAndBacklog": "Active sprint + backlog", "boards.allWork": "All work", "boards.refreshAria": "Refresh board",
  "boards.blockedOne": "{count} item is blocked. Surface the dependency in stand-up and clear the path.",
  "boards.blockedMany": "{count} items are blocked. Surface the dependency in stand-up and clear the path.",
  "boards.sprintModeNotice": "Showing work assigned to active sprints plus the backlog, across the selected project scope.",
  "boards.tuneWorkflow": "Tune this workflow", "boards.newStageName": "New stage name", "boards.wipLimit": "WIP limit", "boards.newStageWipLimitAria": "New stage WIP limit",
  "boards.addStage": "Add stage", "boards.customizeHint": "Owners and managers can customize columns for the selected project.",
  "boards.multiProjectHint": "Multi-project flow is grouped by project inside each stage. Choose one project to customize workflow and WIP limits.",
  "boards.loadingFlow": "Loading flow…", "boards.settingUpWorkflow": "Setting up project workflow…",
  "boards.statusGroup": "Status group", "boards.groupNameAria": "Group name {name}",
  "boards.statusCountOne": "{count} status", "boards.statusCountMany": "{count} statuses",
  "boards.moveItemHint": "Move an item from Backlog to start execution.",
  "boards.errLoadWorkflow": "Unable to load board workflow.", "boards.errAddStage": "Unable to add this workflow stage.",
  "boards.errUpdateWip": "Unable to update WIP limit.", "boards.errUpdateGroup": "Unable to update this board group.",
  "boards.stageAdded": "{name} added to the project workflow.",
  "boards.columnAria": "{name} column", "boards.wip": "WIP", "boards.columnWipLimitAria": "{name} WIP limit",
  "boards.wipExceeded": "WIP limit exceeded. Consider swarming on current work before pulling more.", "boards.dropWorkHere": "Drop work here",
});
