import { queryApi, queryResult } from "../../common/api/queryApi";
import type { OrganizationDirectory } from "../entities/organization";
import { changeActiveOrganization, getOrganizations } from "./organizations";

export const organizationApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    organizations: builder.query<OrganizationDirectory, number | null>({
      queryFn: (_userId, { signal }) =>
        queryResult<OrganizationDirectory>(
          getOrganizations(signal).then((directory): OrganizationDirectory => {
            if (!signal.aborted) {
              const activeId =
                directory.active_organization_id ?? directory.organizations[0]?.id ?? null;
              if (activeId === null) sessionStorage.removeItem("active_organization_id");
              else sessionStorage.setItem("active_organization_id", String(activeId));
            }
            return directory;
          }),
        ),
    }),
    switchOrganization: builder.mutation<unknown, number>({
      queryFn: (id) => queryResult(changeActiveOrganization(id)),
    }),
  }),
});

export const { useOrganizationsQuery, useSwitchOrganizationMutation } = organizationApi;
