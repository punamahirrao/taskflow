import { apiFetch } from "../../common/api/client";
import { queryApi, type DataScope } from "../../common/api/queryApi";

import type { Release, ReleaseAction, ReleaseDirectory, ReleaseDraft } from "../entities/release";

const root = "/projects/releases/";

async function request<T>(path: string, options: RequestInit) {
  try {
    return { data: await apiFetch<T>(path, options) };
  } catch (cause) {
    return {
      error: { message: cause instanceof Error ? cause.message : "Could not update releases." },
    };
  }
}

const releasesApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    releases: builder.query<ReleaseDirectory, DataScope & { mine?: boolean }>({
      queryFn: (scope, api) =>
        request<ReleaseDirectory>(`${root}${scope.mine ? "?mine=true" : ""}`, {
          signal: api.signal,
        }),
      providesTags: ["Planning", "Tasks"],
    }),
    saveRelease: builder.mutation<Release, { id?: number; values: ReleaseDraft }>({
      queryFn: ({ id, values }) =>
        request<Release>(id ? `${root}${id}/` : root, {
          method: id ? "PATCH" : "POST",
          body: JSON.stringify(values),
        }),
      invalidatesTags: ["Planning", "Audit"],
    }),
    changeRelease: builder.mutation<Release, { id: number; input: ReleaseAction }>({
      queryFn: ({ id, input }) =>
        request<Release>(`${root}${id}/actions/`, { method: "POST", body: JSON.stringify(input) }),
      invalidatesTags: ["Planning", "Audit"],
    }),
  }),
});

export const { useReleasesQuery, useSaveReleaseMutation, useChangeReleaseMutation } = releasesApi;
