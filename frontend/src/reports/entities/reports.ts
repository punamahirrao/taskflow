import type { Sprint } from "../../common/entities/task";

export interface StatusDefinition {
  label: string;
  key: string;
  color: string;
}

export interface StatusCount {
  label: string;
  count: number;
  color: string;
}

export interface WorkloadMember {
  name: string;
  count: number;
  points: number;
}

export interface SprintProgressRow {
  sprint: Sprint;
  planned: number;
  delivered: number;
  capacity: number | null;
}
