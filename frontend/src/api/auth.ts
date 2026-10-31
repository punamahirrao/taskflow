import { apiFetch } from "./client";
import type { User } from "../entities/user";

type AuthResponse = { tokens: { access: string; refresh: string }; user: Pick<User, "id" | "email" | "job_title"> };

export async function login(email: string, password: string): Promise<boolean> {
  const data = await apiFetch<AuthResponse>("/accounts/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem("access_token", data.tokens.access);
  sessionStorage.setItem("refresh_token", data.tokens.refresh);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return !data.user.job_title;
}

export async function register(email: string, jobTitle: string, password: string, confirmPassword: string): Promise<void> {
  await apiFetch("/accounts/register/", {
    method: "POST",
    body: JSON.stringify({ email, job_title: jobTitle, password, confirm_password: confirmPassword }),
  });
}

export async function googleLogin(credential: string): Promise<boolean> {
  const data = await apiFetch<AuthResponse>("/accounts/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  sessionStorage.setItem("access_token", data.tokens.access);
  sessionStorage.setItem("refresh_token", data.tokens.refresh);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return !data.user.job_title;
}

export async function microsoftLogin(credential: string): Promise<boolean> {
  const data = await apiFetch<AuthResponse>("/accounts/microsoft/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  sessionStorage.setItem("access_token", data.tokens.access);
  sessionStorage.setItem("refresh_token", data.tokens.refresh);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return !data.user.job_title;
}
