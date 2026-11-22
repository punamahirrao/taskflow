import { apiFetch } from "../../../api/client";
import { queryApi, queryResult, type DataScope } from "../../../api/queryApi";
import type { NavigationOverrides, NavigationPreferences } from "../navigationCatalog";

const path = "/accounts/me/navigation/";
const navigationApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    navigationPreferences: builder.query<NavigationPreferences, DataScope>({
      queryFn: (_scope, { signal }) =>
        queryResult(apiFetch<NavigationPreferences>(path, { signal })),
    }),
    saveNavigationPreferences: builder.mutation<NavigationPreferences, NavigationOverrides>({
      queryFn: (items) =>
        queryResult(
          apiFetch<NavigationPreferences>(path, {
            method: "PUT",
            body: JSON.stringify({ items }),
          }),
        ),
    }),
  }),
});

export const { useNavigationPreferencesQuery, useSaveNavigationPreferencesMutation } =
  navigationApi;
export const navigationCache = navigationApi.util;
