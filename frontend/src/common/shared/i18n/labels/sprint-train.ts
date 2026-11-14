import { defineLabels } from "./defineLabels";

export const sprintTrainLabels = defineLabels({
  // Header and views
  "sprintTrain.allProjects": "All Projects", "sprintTrain.piOverallProgress": "PI Overall Progress",
  "sprintTrain.progressSummary": "{points} / {capacity} pts ({percent}%)",
  "sprintTrain.addStory": "Add Story", "sprintTrain.closeAddStory": "Close Add Story", "sprintTrain.newSprint": "New Sprint",
  "sprintTrain.switchToLightTheme": "Switch to light theme", "sprintTrain.switchToNightTheme": "Switch to night theme",
  "sprintTrain.viewsNav": "Sprint Train views", "sprintTrain.tabWorkflow": "Sprint Train Workflow", "sprintTrain.teamCapacity": "Team Capacity",
  "sprintTrain.tabDependenciesSingular": "Dependency Matrix ({count} Risk)", "sprintTrain.tabDependenciesPlural": "Dependency Matrix ({count} Risks)",
  "sprintTrain.filterByProject": "Filter by project", "sprintTrain.searchStoriesAndSprints": "Search stories and sprints",
  "sprintTrain.searchStoriesPlaceholder": "Search stories...", "sprintTrain.filterByTeam": "Filter by team", "sprintTrain.allTeams": "All Teams",
  "sprintTrain.filterAll": "all", "sprintTrain.filterActive": "active", "sprintTrain.filterFuture": "future",
  "sprintTrain.dismiss": "Dismiss", "sprintTrain.datesNotSet": "Dates not set",

  // Sprint pipeline
  "sprintTrain.sprintPipeline": "Sprint pipeline", "sprintTrain.completedSprint": "Completed Sprint", "sprintTrain.activeSprint": "Active Sprint",
  "sprintTrain.upcomingSprint": "Upcoming Sprint", "sprintTrain.activeSelection": "Active Selection", "sprintTrain.stories": "Stories",
  "sprintTrain.pointsCapacity": "Points / Capacity", "sprintTrain.pointsOfCapacity": "{points} / {capacity} pts", "sprintTrain.points": "{points} pts",
  "sprintTrain.noTeamAssigned": "No team assigned", "sprintTrain.showingSprints": "Showing {shown} of {total} sprints.",
  "sprintTrain.showFewer": "Show fewer", "sprintTrain.showAll": "Show all", "sprintTrain.displayLimitHint": "Display limit can also be changed in Settings.",
  "sprintTrain.noSprints": "No sprints to show", "sprintTrain.loadingProjectWork": "Loading project work...",
  "sprintTrain.createSprintHint": "Create a sprint from the Backlog page to start planning.", "sprintTrain.sprint": "Sprint",

  // Sprint stories list
  "sprintTrain.sprintStoriesList": "Sprint Stories List", "sprintTrain.sprintStoriesListFor": "{name} — Sprint Stories List",
  "sprintTrain.sprintStoriesListHint": "Inline list view. Drag stories from the backlog drawer onto a sprint card or this list.",
  "sprintTrain.moveUp": "Move up", "sprintTrain.moveUpStory": "Move {title} up", "sprintTrain.moveDown": "Move down", "sprintTrain.moveDownStory": "Move {title} down",
  "sprintTrain.noStoriesInSprint": "No stories in this sprint yet. Drag a backlog story here to add one.",
  "sprintTrain.selectSprintToViewStories": "Select a sprint to view its stories.",

  // Summary, capacity and dependencies
  "sprintTrain.summaryTitle": "Sprint Train Summary", "sprintTrain.deliveryAtAGlance": "Delivery at a glance", "sprintTrain.plannedSprints": "Planned Sprints",
  "sprintTrain.activeSprints": "Active Sprints", "sprintTrain.backlogStories": "Backlog Stories", "sprintTrain.openGlobalBacklog": "Open Global Backlog",
  "sprintTrain.teamCapacityHint": "Estimated sprint points grouped by assigned team.", "sprintTrain.assignedStories": "{count} assigned stories",
  "sprintTrain.teamCapacityEmpty": "Team capacity will appear when stories are assigned.",
  "sprintTrain.dependencyMatrix": "Dependency Matrix", "sprintTrain.dependencyMatrixHint": "Sprint stories with unresolved dependencies.",
  "sprintTrain.noUnresolvedDependencies": "No unresolved dependencies in the sprint train.",

  // Global backlog drawer
  "sprintTrain.globalBacklogDrawerAria": "Global backlog drawer", "sprintTrain.globalBacklogDrawer": "Global Backlog Drawer",
  "sprintTrain.backlogItemsAndPool": "Backlog Items & Story Pool", "sprintTrain.closeBacklogDrawer": "Close backlog drawer",
  "sprintTrain.availableBacklogStories": "Available Backlog Stories", "sprintTrain.itemsCount": "{count} Items", "sprintTrain.totalPool": "Total Pool",
  "sprintTrain.backlogDragHint": "Drag stories onto any matching-project sprint card or the selected sprint list.",
  "sprintTrain.cancelNewStory": "Cancel New Story", "sprintTrain.createStoryIn": "Create Story in {name}", "sprintTrain.selectSprintToCreateStory": "Select a Sprint to Create a Story",
  "sprintTrain.newStoryIn": "New story · {name}", "sprintTrain.savingStory": "Saving story...", "sprintTrain.addStoryToSprint": "Add Story to Sprint",
  "sprintTrain.searchBacklog": "Search backlog", "sprintTrain.searchBacklogPlaceholder": "Search backlog...",
  "sprintTrain.toggleReadyFilter": "Toggle ready stories filter", "sprintTrain.readyFilterActive": "Showing stories marked ready for a sprint.",
  "sprintTrain.openDetailsFor": "Open details for {title}", "sprintTrain.assigneeName": "Assignee: {name}", "sprintTrain.unassigned": "Unassigned",
  "sprintTrain.statusTodo": "To Do", "sprintTrain.loadingBacklog": "Loading backlog...", "sprintTrain.noBacklogMatches": "No backlog stories match these filters.",
  "sprintTrain.backlogFooter": "Stories and sprint assignments are saved to the project.",

  // Add story drawer
  "sprintTrain.addStoryDrawerAria": "Add story drawer", "sprintTrain.addAStory": "Add a story",
  "sprintTrain.addStoryHint": "Create a story directly in the selected sprint.", "sprintTrain.closeAddStoryDrawer": "Close add story drawer",
  "sprintTrain.selectedSprint": "Selected sprint", "sprintTrain.storyTitlePlaceholder": "Write a clear, actionable story",
  "sprintTrain.storyDescriptionPlaceholder": "Add context, acceptance notes, or expected outcome", "sprintTrain.storyPointsPlaceholder": "e.g. 3",
  "sprintTrain.addingStory": "Adding story...", "sprintTrain.addToSprint": "Add to Sprint", "sprintTrain.chooseFromBacklog": "Choose from backlog",
  "sprintTrain.selectSprintBeforeAdding": "Select a sprint before adding a story.", "sprintTrain.openBacklog": "Open Backlog",

  // Create sprint dialog
  "sprintTrain.createSprint": "Create Sprint", "sprintTrain.createSprintDialogHint": "Save a planned or active sprint to the selected project.",
  "sprintTrain.closeCreateSprintDialog": "Close create sprint dialog", "sprintTrain.sprintName": "Sprint name",
  "sprintTrain.sprintNamePlaceholder": "e.g. Sprint 2.1: Platform Improvements", "sprintTrain.startDate": "Start date", "sprintTrain.endDate": "End date",
  "sprintTrain.capacityPoints": "Capacity (points)", "sprintTrain.sprintGoal": "Sprint goal", "sprintTrain.startAsActive": "Start as active sprint",
  "sprintTrain.activeSprintExistsHint": "This project already has an active sprint; create another planned sprint.",
  "sprintTrain.plannedSprintHint": "Leave unchecked to add this sprint as planned.", "sprintTrain.creating": "Creating...",

  // Shared form labels
  "sprintTrain.title": "Title", "sprintTrain.description": "Description", "sprintTrain.storyPoints": "Story points", "sprintTrain.cancel": "Cancel",

  // Feedback and errors
  "sprintTrain.errorLoadSprints": "Unable to load sprints.", "sprintTrain.errorChooseProjectAndName": "Choose a project and enter a sprint name.",
  "sprintTrain.errorEndBeforeStart": "Sprint end date must be on or after the start date.",
  "sprintTrain.errorActiveSprintExists": "This project already has an active sprint. Create another planned sprint instead.",
  "sprintTrain.errorCapacityRange": "Capacity must be a whole number between 0 and 32767.", "sprintTrain.sprintCreatedFor": "{sprint} created for {project}.",
  "sprintTrain.errorCreateSprint": "Unable to create sprint.", "sprintTrain.errorSelectSprintAndTitle": "Select a sprint and enter a story title.",
  "sprintTrain.storyAddedTo": "{title} added to {sprint}.", "sprintTrain.errorCreateStory": "Unable to create story.",
  "sprintTrain.errorSameProject": "Choose a backlog story from the same project as this sprint.",
  "sprintTrain.errorAddToSprint": "Unable to add this story to the sprint.",

  // Story details drawer
  "sprintTrain.detailsFor": "Details for {title}", "sprintTrain.addTitle": "Add a title", "sprintTrain.closeStoryDetails": "Close story details",
  "sprintTrain.clickToEdit": "Click to edit", "sprintTrain.clickToAdd": "Click to add", "sprintTrain.status": "Status", "sprintTrain.editTaskStatus": "Edit task status",
  "sprintTrain.clickToEditStatus": "Click to edit status", "sprintTrain.priority": "Priority", "sprintTrain.editTaskPriority": "Edit task priority",
  "sprintTrain.clickToEditPriority": "Click to edit priority", "sprintTrain.blocked": "Blocked",
  "sprintTrain.statusInProgress": "In Progress", "sprintTrain.statusReview": "Review", "sprintTrain.statusWaiting": "Waiting", "sprintTrain.statusDone": "Done",
  "sprintTrain.priorityUrgent": "urgent priority", "sprintTrain.priorityHigh": "high priority", "sprintTrain.priorityMedium": "medium priority", "sprintTrain.priorityLow": "low priority",
  "sprintTrain.detailsSections": "Task details sections", "sprintTrain.tabDetails": "details", "sprintTrain.tabComments": "comments", "sprintTrain.tabHistory": "history",
  "sprintTrain.projectNumber": "Project {id}", "sprintTrain.notInSprint": "Not in a sprint", "sprintTrain.assignedTo": "Assigned to",
  "sprintTrain.estimate": "Estimate", "sprintTrain.dueDate": "Due date", "sprintTrain.tags": "Tags", "sprintTrain.definitionOfReady": "Definition of ready",
  "sprintTrain.dependencies": "Dependencies", "sprintTrain.addDescription": "Add a description", "sprintTrain.addEstimate": "Add story points",
  "sprintTrain.addDueDate": "Add due date", "sprintTrain.addTags": "Add tags, separated by commas",
  "sprintTrain.readyDescription": "Description added", "sprintTrain.readyEstimate": "Estimate added", "sprintTrain.readyOwner": "Owner assigned", "sprintTrain.readyForSprint": "Ready for sprint",
  "sprintTrain.loadingComments": "Loading comments…", "sprintTrain.noCommentsYet": "No comments yet", "sprintTrain.noCommentsHint": "Start the conversation about this work item.",
  "sprintTrain.edited": " · edited", "sprintTrain.editComment": "Edit comment", "sprintTrain.deleteComment": "Delete comment", "sprintTrain.saveEdit": "Save edit",
  "sprintTrain.addComment": "Add a comment", "sprintTrain.commentPlaceholder": "Share an update or ask a question…", "sprintTrain.postComment": "Post comment",
  "sprintTrain.historyHint": "Read-only task activity trail.", "sprintTrain.loadingHistory": "Loading history…", "sprintTrain.noHistory": "No history recorded for this task yet.",
  "sprintTrain.historyBy": "by {name}", "sprintTrain.historyAdded": "Added", "sprintTrain.historyChangedFrom": "{value} → ", "sprintTrain.none": "None",
  "sprintTrain.confirmDeleteComment": "Delete this comment?", "sprintTrain.errorLoadActivity": "Unable to load task activity.",
  "sprintTrain.errorAddComment": "Unable to add comment.", "sprintTrain.errorUpdateComment": "Unable to update comment.", "sprintTrain.errorDeleteComment": "Unable to delete comment.",
});
