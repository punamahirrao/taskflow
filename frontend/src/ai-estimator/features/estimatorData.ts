import type { Epic, MacroStory, PipelineStep } from "../entities/estimator";
import type { TranslationKey } from "../../common/entities/language";

export const PIPELINE_STEPS: PipelineStep[] = [
  { titleKey: "aiEstimator.stepParsing", detailKey: "aiEstimator.stepParsingDetail" },
  { titleKey: "aiEstimator.stepExtracting", detailKey: "aiEstimator.stepExtractingDetail" },
  { titleKey: "aiEstimator.stepGrouping", detailKey: "aiEstimator.stepGroupingDetail" },
  { titleKey: "aiEstimator.stepEstimating", detailKey: "aiEstimator.stepEstimatingDetail" },
];

export const ESTIMATOR_STEP_LABELS: TranslationKey[] = ["aiEstimator.stepUpload", "aiEstimator.stepRun"];

export const INITIAL_MACRO_STORIES: MacroStory[] = [
  { id: "MS-01", title: "Account and access management", description: "Users can register, sign in, and manage secure access to the workspace.", points: 13 },
  { id: "MS-02", title: "Project and team collaboration", description: "Teams can create projects, manage membership, and coordinate their work.", points: 21 },
  { id: "MS-03", title: "Backlog, boards, and sprint planning", description: "Teams can organize work, track progress on boards, and plan sprint delivery.", points: 34 },
  { id: "MS-04", title: "Reporting and progress visibility", description: "Team members can review project status, delivery progress, and key summaries.", points: 13 },
];

export const INITIAL_EPICS: Epic[] = [
  { id: "EP-01", title: "Identity and account access", description: "Registration, sign-in, and profile access.", stories: [{ id: "US-101", title: "Register with an email address", points: 3 }, { id: "US-102", title: "Sign in to the workspace", points: 5 }, { id: "US-103", title: "Manage account profile", points: 3 }] },
  { id: "EP-02", title: "Project collaboration", description: "Project setup, team membership, and shared planning.", stories: [{ id: "US-201", title: "Create and configure a project", points: 5 }, { id: "US-202", title: "Invite project members", points: 5 }, { id: "US-203", title: "Manage member roles", points: 3 }, { id: "US-204", title: "View project workspace", points: 5 }] },
  { id: "EP-03", title: "Work and sprint management", description: "Backlog, board workflows, and sprint planning.", stories: [{ id: "US-301", title: "Create and prioritize backlog items", points: 8 }, { id: "US-302", title: "Organize work on a board", points: 8 }, { id: "US-303", title: "Plan a sprint", points: 5 }, { id: "US-304", title: "Track sprint progress", points: 8 }, { id: "US-305", title: "Complete and review a sprint", points: 5 }] },
  { id: "EP-04", title: "Project reporting", description: "Status summaries and progress visibility.", stories: [{ id: "US-401", title: "View project progress summary", points: 5 }, { id: "US-402", title: "Review completed and outstanding work", points: 3 }, { id: "US-403", title: "Filter reports by project", points: 5 }] },
];
