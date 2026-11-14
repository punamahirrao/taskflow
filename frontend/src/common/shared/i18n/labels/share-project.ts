import { defineLabels } from "./defineLabels";

export const shareProjectLabels = defineLabels({
  "shareProject.loading": "Loading...", "shareProject.notFound": "Project not found.", "shareProject.unableToLoad": "Unable to load data.",
  "shareProject.unableToSaveRole": "Unable to save role.", "shareProject.unableToRemoveMember": "Unable to remove member.",
  "shareProject.confirmRemove": "Remove {name} from this project?", "shareProject.backTo": "Back to {name}", "shareProject.title": "Share “{name}”",
  "shareProject.subtitle": "Choose a user and give them a role on this project.", "shareProject.ownerOnly": "Only the project owner or an admin can share this project.",
  "shareProject.form.addUser": "Add user", "shareProject.form.searchPlaceholder": "Search by name or email...", "shareProject.form.noUsers": "No users available.",
  "shareProject.form.role": "Role",
  "shareProject.table.caption": "People on this project", "shareProject.table.user": "User", "shareProject.table.projectRole": "Project role",
  "shareProject.table.actions": "Actions", "shareProject.table.removeFromProject": "Remove from project", "shareProject.table.roleFor": "Role for {name}",
  "shareProject.table.editRole": "Edit role", "shareProject.table.editRoleFor": "Edit role for {name}", "shareProject.table.removeMember": "Remove {name}",
  "shareProject.table.cannotChange": "Cannot be changed", "shareProject.table.empty": "No one has been added yet.",
});
