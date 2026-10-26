import { apiFetch } from "./client";
import type { SiteUser, User } from "../entities/user";

type CreateUserInput = Pick<User, "first_name" | "last_name" | "email"> & { password: string };

export const getUsers = () => apiFetch<SiteUser[]>("/accounts/users/");
export const createUser = (input: CreateUserInput) => apiFetch<User>("/accounts/users/", {
  method: "POST", body: JSON.stringify(input),
});
export const updateUser = (id: number, input: Partial<User>) => apiFetch<User>(`/accounts/users/${id}/`, {
  method: "PATCH", body: JSON.stringify(input),
});
export const deleteUser = (id: number) => apiFetch<void>(`/accounts/users/${id}/`, { method: "DELETE" });
