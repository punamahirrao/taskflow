export type Project = {
  id: number;
  name: string;
  description: string;
  expected_start_date?: string | null;
  end_date?: string | null;
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
  job_title: string;
  role: string;
  photo_url?: string | null;
  removal_date?: string | null;
};

export type ProjectCreateInput = Pick<Project, "name" | "description"> & {
  expected_start_date?: string | null;
  end_date?: string | null;
};
