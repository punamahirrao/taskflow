export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
};

export type SiteUser = User & { is_staff: boolean; is_active: boolean; date_joined: string };

export type Profile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  photo_url: string | null;
};
