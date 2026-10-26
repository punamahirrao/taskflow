import { apiFetch } from "./client";
import type { User } from "../entities/user";

type AuthResponse = { tokens: { access: string; refresh: string }; user: User };

export async function login(email: string, password: string): Promise<void> {
  const data = await apiFetch<AuthResponse>("/accounts/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem("access_token", data.tokens.access);
  sessionStorage.setItem("refresh_token", data.tokens.refresh);
  sessionStorage.setItem("user", JSON.stringify(data.user));
}

export async function register(email: string, password: string, confirmPassword: string): Promise<void> {
  await apiFetch("/accounts/register/", {
    method: "POST",
    body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
  });
}
