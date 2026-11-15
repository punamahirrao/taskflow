import { apiFetch } from "../../common/api/client";
import type { AuthResponse } from "../../common/entities/auth";
import type { User } from "../../common/entities/user";
import { store } from "../../common/store";
import { sessionActions } from "../../common/store/sessionSlice";

function saveSession(data: AuthResponse) {
  sessionStorage.setItem("access_token", data.tokens.access);
  sessionStorage.setItem("refresh_token", data.tokens.refresh);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  store.dispatch(sessionActions.userChanged(data.user));
}

export async function login(email: string, password: string, accountType: User["account_type"] = "private"): Promise<boolean> {
  const data = await apiFetch<AuthResponse>("/accounts/login/", {
    method: "POST",
    body: JSON.stringify({ email, password, account_type: accountType }),
  });
  saveSession(data);
  return !data.user.job_title;
}

export async function googleLogin(credential: string): Promise<boolean> {
  const data = await apiFetch<AuthResponse>("/accounts/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  saveSession(data);
  return !data.user.job_title;
}

export async function microsoftLogin(credential: string): Promise<boolean> {
  const data = await apiFetch<AuthResponse>("/accounts/microsoft/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  saveSession(data);
  return !data.user.job_title;
}
