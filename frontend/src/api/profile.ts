import { apiFetch } from "./client";
import type { Profile, TeamMemberProfile } from "../entities/user";

export const getProfile = () => apiFetch<Profile>("/accounts/me/");
export const getTeamMemberProfile = (userId: number) => apiFetch<TeamMemberProfile>(`/accounts/users/${userId}/team-profile/`);

function broadcast(profile: Profile) {
  try {
    const stored = JSON.parse(sessionStorage.getItem("user") ?? "{}") as Record<string, unknown>;
    sessionStorage.setItem("user", JSON.stringify({ ...stored, job_title: profile.job_title }));
  } catch {
    sessionStorage.setItem("user", JSON.stringify({ job_title: profile.job_title }));
  }
  window.dispatchEvent(new CustomEvent("profile-updated", { detail: profile }));
  return profile;
}

export const updateProfile = (input: Pick<Profile, "first_name" | "last_name" | "job_title" | "department" | "about_me">) =>
  apiFetch<Profile>("/accounts/me/", { method: "PATCH", body: JSON.stringify(input) }).then(broadcast);

export function uploadProfilePhoto(file: File) {
  const body = new FormData();
  body.append("photo", file);
  return apiFetch<Profile>("/accounts/me/photo/", { method: "POST", body }).then(broadcast);
}

export const removeProfilePhoto = () => apiFetch<Profile>("/accounts/me/photo/", { method: "DELETE" }).then(broadcast);

export const changePassword = (input: { current_password: string; new_password: string; confirm_password: string }) =>
  apiFetch<{ message: string }>("/accounts/me/password/", { method: "POST", body: JSON.stringify(input) });
