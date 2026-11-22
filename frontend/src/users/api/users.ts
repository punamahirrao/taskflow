import { apiFetch } from "../../common/api/client";
import type { CreateUserInput, SiteUser, User } from "../../common/entities/user";

export const getUsers = () => apiFetch<SiteUser[]>("/accounts/users/");
export const createUser = (input: CreateUserInput) =>
  apiFetch<User>("/accounts/users/", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateUser = (id: number, input: Partial<User>) =>
  apiFetch<User>(`/accounts/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const deleteUser = (id: number) =>
  apiFetch<void>(`/accounts/users/${id}/`, { method: "DELETE" });
