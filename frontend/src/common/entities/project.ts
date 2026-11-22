export interface Project {
  id: number;
  name: string;
  description: string;
  status: "in_progress" | "upcoming" | "archived";
  expected_start_date?: string | null;
  end_date?: string | null;
  progress?: number;
  owner: number | null;
  owner_details?: ProjectOwner | null;
  my_role?: string | null;
  can_create_board?: boolean;
  is_default?: boolean;
  members?: ProjectMember[];
}

export interface ProjectOwner {
  id: number;
  name: string;
  photo_url?: string | null;
}

export interface ProjectMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  role: string;
  photo_url?: string | null;
  removal_date?: string | null;
}

export interface ProjectCreateInput extends Pick<Project, "name" | "description"> {
  status?: Project["status"];
  expected_start_date?: string | null;
  end_date?: string | null;
}

export interface DefaultProjectResponse {
  default_project_id: number | null;
}

export interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  selectedId: number | null;
  select: (projectId: number | null) => void;
  setDefault: (projectId: number | null) => Promise<void>;
}
