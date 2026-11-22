import { createContext, useContext } from "react";

import type { OrganizationState } from "../entities/organization";

export const OrganizationContext = createContext<OrganizationState | null>(null);
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error("OrganizationProvider is required.");
  return context;
}
