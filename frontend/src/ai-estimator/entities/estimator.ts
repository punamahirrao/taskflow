import type { TranslationKey } from "../../common/entities/language";

export interface PipelineStep {
  titleKey: TranslationKey;
  detailKey: TranslationKey;
}

export type EstimatorStage = "queued" | "running" | "complete" | "failed";

export interface EstimationMacroStory {
  id: string;
  title: string;
  description: string;
  story_points: number;
  requirement_ids?: string[];
  rationale?: string;
  confidence?: number;
}

export interface EstimationResult {
  macro_stories?: EstimationMacroStory[];
  total_story_points?: number;
}

export interface EstimationRun {
  id: string;
  project_id: number;
  document_id: number;
  document_name: string;
  status: string;
  stages: Record<string, EstimatorStage>;
  result: EstimationResult;
  error: string;
}

export interface MacroStory {
  id: string;
  title: string;
  description: string;
  points: number;
}

export interface EpicStory {
  id: string;
  title: string;
  points: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  stories: EpicStory[];
}
