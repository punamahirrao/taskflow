import { apiFetch } from "../../../api/client";
import { queryApi, queryResult, type DataScope } from "../../../api/queryApi";
import type { TypographyPreferences } from "../localFonts";

const path = "/accounts/me/typography/";
const typographyApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    typographyPreferences: builder.query<TypographyPreferences, DataScope>({
      queryFn: (_scope, { signal }) =>
        queryResult(apiFetch<TypographyPreferences>(path, { signal })),
    }),
    saveTypographyPreferences: builder.mutation<TypographyPreferences, TypographyPreferences>({
      queryFn: (preferences) =>
        queryResult(
          apiFetch<TypographyPreferences>(path, {
            method: "PUT",
            body: JSON.stringify(preferences),
          }),
        ),
    }),
  }),
});

export const { useTypographyPreferencesQuery, useSaveTypographyPreferencesMutation } =
  typographyApi;
export const typographyCache = typographyApi.util;
