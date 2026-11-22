import type {
  Organization,
  OrganizationDirectory,
} from "../../organizations/entities/organization";
import { mockProjects } from "../projects";
import { mockUser } from "../users";

export const mockOrganization: Organization = {
  id: 20,
  name: "Atlas Labs",
  owner_id: mockUser.id,
  created_at: "2026-09-01T10:00:00Z",
  project_count: mockProjects.length,
  role: "owner",
};

export const mockOrganizationDirectory: OrganizationDirectory = {
  organizations: [
    mockOrganization,
    {
      ...mockOrganization,
      id: 21,
      name: "Atlas Sandbox",
      created_at: "2026-10-16T11:00:00Z",
      project_count: 0,
    },
  ],
  active_organization_id: mockOrganization.id,
  limit: 2,
};
