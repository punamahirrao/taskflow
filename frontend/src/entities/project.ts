export type Project = {
  id: number;
  name: string;
  description: string;
  due_date?: string | null;
  progress?: number;
  owner: number;
  my_role?: string | null;
  is_default?: boolean;
  members?: ProjectMember[];
};

export type ProjectMember = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  photo_url?: string | null;
};

export type ProjectCreateInput = Pick<Project, "name" | "description"> & { due_date?: string | null };
