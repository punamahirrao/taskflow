import type { User } from "./user";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: Pick<User, "id" | "email" | "job_title" | "account_type">;
}

export interface TokenRefreshResponse {
  access?: string;
}
