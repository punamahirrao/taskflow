import { apiFetch } from "../../common/api/client";
import type { Organization, OrganizationDirectory } from "../entities/organization";

const root = "/accounts/organizations/";
export const getOrganizations = (signal?: AbortSignal) =>
  apiFetch<OrganizationDirectory>(root, { signal });
export const createOrganization = (name: string) =>
  apiFetch<Organization>(root, { method: "POST", body: JSON.stringify({ name }) });
export const changeActiveOrganization = (id: number) =>
  apiFetch(`${root}${id}/switch/`, { method: "POST" });
