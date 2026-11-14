import { aiEstimatorLabels } from "../labels/ai-estimator";
import { backlogLabels } from "../labels/backlog";
import { boardsLabels } from "../labels/boards";
import { calendarLabels } from "../labels/calendar";
import { commonLabels } from "../labels/common";
import { dashboardLabels } from "../labels/dashboard";
import { documentsLabels } from "../labels/documents";
import { loginLabels } from "../labels/login";
import { portfolioLabels } from "../labels/portfolio";
import { profileLabels } from "../labels/profile";
import { projectDetailLabels } from "../labels/project-detail";
import { projectsLabels } from "../labels/projects";
import { registerLabels } from "../labels/register";
import { reportsLabels } from "../labels/reports";
import { settingsLabels } from "../labels/settings";
import { shareProjectLabels } from "../labels/share-project";
import { sprintTrainLabels } from "../labels/sprint-train";
import { teamLabels } from "../labels/team";
import { usersLabels } from "../labels/users";

export const en = {
  ...commonLabels.en, ...aiEstimatorLabels.en, ...backlogLabels.en, ...boardsLabels.en, ...calendarLabels.en,
  ...dashboardLabels.en, ...documentsLabels.en, ...loginLabels.en, ...portfolioLabels.en, ...profileLabels.en,
  ...projectDetailLabels.en, ...projectsLabels.en, ...registerLabels.en, ...reportsLabels.en, ...settingsLabels.en,
  ...shareProjectLabels.en, ...sprintTrainLabels.en, ...teamLabels.en, ...usersLabels.en,
};
