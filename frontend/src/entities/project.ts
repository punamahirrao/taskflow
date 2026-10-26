export type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
  my_role?: string | null;
  members?: ProjectMember[];
};

export type ProjectMember = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export type ProjectCreateInput = Pick<Project, "name" | "description">;
