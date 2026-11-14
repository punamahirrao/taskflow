import type { TranslationKey } from "../../../entities/language";
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

// Keys without a Swedish translation fall back to English (see translate.ts).
export const sv: Partial<Record<TranslationKey, string>> = {
  ...commonLabels.sv, ...aiEstimatorLabels.sv, ...backlogLabels.sv, ...boardsLabels.sv, ...calendarLabels.sv,
  ...dashboardLabels.sv, ...documentsLabels.sv, ...loginLabels.sv, ...portfolioLabels.sv, ...profileLabels.sv,
  ...projectDetailLabels.sv, ...projectsLabels.sv, ...registerLabels.sv, ...reportsLabels.sv, ...settingsLabels.sv,
  ...shareProjectLabels.sv, ...sprintTrainLabels.sv, ...teamLabels.sv, ...usersLabels.sv,
};
