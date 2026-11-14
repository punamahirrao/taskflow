export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  account_type: "private" | "organization";
  job_title: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface SiteUser extends User {
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface CreateUserInput extends Pick<User, "first_name" | "last_name" | "email" | "job_title" | "account_type"> {
  password: string;
}

export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  about_me: string;
  photo_url: string | null;
}

export type TeamMemberProfile = Pick<Profile, "id" | "first_name" | "last_name" | "email" | "job_title" | "department" | "about_me" | "photo_url">;

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface MessageResponse {
  message: string;
}
