export const workTimeCategories = ["Task work", "Meetings", "Learning", "Other"] as const;
export type WorkTimeCategory = (typeof workTimeCategories)[number];
export interface WorkTimeDraft {
  date: string;
  minutes: number;
  category: WorkTimeCategory;
  note: string;
}
export interface WorkTimeEntry extends WorkTimeDraft {
  id: string;
}
