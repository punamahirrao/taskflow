import { defineLabels } from "./defineLabels";

export const projectsLabels = defineLabels({
  "projects.create": "+ Create", "projects.loading": "Loading projects...", "projects.noMatch": "No projects match your search.",
  "projects.statusLabel": "Project status", "projects.statusInProgress": "In progress", "projects.statusUpcoming": "Upcoming", "projects.statusArchived": "Archived", "projects.filterStatus": "Filter projects by status", "projects.allStatuses": "All statuses",
  "projects.empty": "No projects found. Click “Create Project” to add your first one.", "projects.unableToUpdateDefault": "Unable to update default project.", "projects.defaultUpdatedToast": "Default project updated.",
  "projects.dialog.title": "Create new project", "projects.dialog.closeDialog": "Close dialog", "projects.dialog.projectName": "Project name",
  "projects.dialog.projectNamePlaceholder": "Enter project name", "projects.dialog.description": "Description", "projects.dialog.descriptionPlaceholder": "Enter project description",
  "projects.dialog.expectedStartDate": "Expected start date (optional)", "projects.dialog.endDate": "End date (optional)", "projects.dialog.cancel": "Cancel",
  "projects.dialog.creating": "Creating...", "projects.dialog.submit": "Create", "projects.dialog.nameRequired": "Project name is required.",
  "projects.dialog.endBeforeStart": "End date must be on or after the expected start date.", "projects.dialog.unableToCreate": "Unable to create project.", "projects.dialog.createdToast": "{name} created.",
  "projects.avatars.team": "Team: {names}", "projects.avatars.more": "{count} more",
  "projects.card.noEndDate": "No end date", "projects.card.dayPastEnd": "{count} day past end", "projects.card.daysPastEnd": "{count} days past end",
  "projects.card.endsToday": "Ends today", "projects.card.dayUntilEnd": "{count} day until end", "projects.card.daysUntilEnd": "{count} days until end",
  "projects.card.weekLeft": "{count} week left", "projects.card.weeksLeft": "{count} weeks left", "projects.card.projectNumber": "Project #{id}",
  "projects.card.default": "Default", "projects.card.noDescription": "No description provided.", "projects.card.progress": "Progress",
  "projects.card.progressAria": "{name} progress", "projects.card.removeDefaultAria": "Remove {name} as default project", "projects.card.setDefaultAria": "Set {name} as default project",
  "projects.card.defaultTitle": "Default project (click to unset)", "projects.card.setDefaultTitle": "Set as default project",
});
