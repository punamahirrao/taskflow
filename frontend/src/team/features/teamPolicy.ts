export const ASSIGNABLE_ROLES: Record<string, string[]> = {
  owner: ["admin", "member", "viewer"],
  admin: ["member", "viewer"],
};

export const NO_ROLES: string[] = [];
export const TEAM_FILTER_KEY = "team_project_filter";
