import { apiFetch } from "../../common/api/client";
import type { ChangePasswordInput, MessageResponse, Profile } from "../../common/entities/user";
import { store } from "../../common/store";
import { sessionActions } from "../../common/store/sessionSlice";

export const getProfile = () => apiFetch<Profile>("/accounts/me/");

function broadcast(profile: Profile) {
  let stored: Record<string, unknown> = {};
  try {
    stored = JSON.parse(sessionStorage.getItem("user") ?? "{}") as Record<string, unknown>;
  } catch { stored = {}; }
  const nextUser = { ...stored, email: profile.email, first_name: profile.first_name, last_name: profile.last_name, job_title: profile.job_title };
  try { sessionStorage.setItem("user", JSON.stringify(nextUser)); } catch { /* Redux keeps the current profile in memory */ }
  window.dispatchEvent(new CustomEvent("profile-updated", { detail: profile }));
  store.dispatch(sessionActions.userChanged(nextUser as Partial<import("../../common/entities/user").User>));
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

export const changePassword = (input: ChangePasswordInput) =>
  apiFetch<MessageResponse>("/accounts/me/password/", { method: "POST", body: JSON.stringify(input) });
