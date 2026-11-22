export interface CapacityMember {
  id: number;
  name: string;
  photo_url: string | null;
  role: string;
  job_title: string;
  removal_date: string | null;
  baseline_points: number | null;
  allocation_percent: number;
  available_days: number | null;
  absence_days: number;
  available_points: number | null;
  assigned_points: number;
  can_log_absence: boolean;
}

export interface CapacityAbsence {
  id: number;
  user_id: number;
  kind: "vacation" | "absence";
  start_date: string;
  end_date: string;
  day_fraction: number;
  note: string;
  can_delete: boolean;
}

export interface CapacityHoliday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  can_delete: boolean;
}

export interface SprintCapacity {
  sprint_id: number;
  can_manage: boolean;
  has_dates: boolean;
  working_days: number;
  holiday_days: number;
  members: CapacityMember[];
  summary: {
    member_count: number;
    configured_members: number;
    all_configured: boolean;
    combined_points: number | null;
    suggested_capacity_points: number | null;
    planned_points: number;
    unassigned_points: number;
    outside_team_points: number;
    headroom_points: number | null;
    members_with_time_off: number;
  };
  calendar: { date: string; weekend: boolean; holidays: string[]; available_members: number }[];
  absences: CapacityAbsence[];
  holidays: CapacityHoliday[];
}

export type CapacityPlan = {
  user_id: number;
  baseline_points: number | null;
  allocation_percent: number;
}[];
export type AbsenceInput = Pick<
  CapacityAbsence,
  "user_id" | "kind" | "start_date" | "end_date" | "day_fraction" | "note"
>;
export type HolidayInput = Pick<CapacityHoliday, "name" | "start_date" | "end_date">;
