import { apiFetch } from "./client";
import type { Profile } from "../entities/user";

export const getProfile = () => apiFetch<Profile>("/accounts/me/");

export const updateProfile = (input: Pick<Profile, "first_name" | "last_name" | "job_title" | "department">) =>
  apiFetch<Profile>("/accounts/me/", { method: "PATCH", body: JSON.stringify(input) });

export function uploadProfilePhoto(file: File) {
  const body = new FormData();
  body.append("photo", file);
  return apiFetch<Profile>("/accounts/me/photo/", { method: "POST", body });
}

export const removeProfilePhoto = () => apiFetch<Profile>("/accounts/me/photo/", { method: "DELETE" });

export const changePassword = (input: { current_password: string; new_password: string; confirm_password: string }) =>
  apiFetch<{ message: string }>("/accounts/me/password/", { method: "POST", body: JSON.stringify(input) });
