export interface Organization {
  id: number;
  name: string;
  owner_id: number | null;
  created_at: string;
  project_count: number;
  role?: "owner" | "admin" | "member" | null;
}
export interface OrganizationDirectory {
  organizations: Organization[];
  active_organization_id: number | null;
  limit: number;
  data_environment?: string;
}
export interface OrganizationState {
  environment?: string;
  organizations: Organization[];
  activeOrganization: Organization | null;
  limit: number;
  switching: boolean;
  reload: () => Promise<void>;
  switchOrganization: (id: number) => Promise<void>;
}
