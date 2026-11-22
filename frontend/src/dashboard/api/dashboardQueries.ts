import { queryApi, queryError, type DataScope, scopedPath } from "../../common/api/queryApi";
import type { DeliverySnapshot } from "../entities/delivery";
import { apiFetch } from "../../common/api/client";

export interface ActivityItem {
  id: number;
  task_id: number;
  project_id: number;
  title: string;
  project_name: string;
  action: string;
  actor: string;
  created_at: string;
}

export const dashboardQueries = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    delivery: builder.query<DeliverySnapshot, DataScope>({
      async queryFn(scope, api) {
        try {
          return {
            data: await apiFetch<DeliverySnapshot>(scopedPath("/dashboard/delivery/", scope), {
              signal: api.signal,
            }),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Tasks", "Planning"],
    }),
    activity: builder.query<
      ActivityItem[],
      DataScope & { mine?: boolean; currentProjects?: boolean }
    >({
      async queryFn(scope, api) {
        try {
          return {
            data: await apiFetch<ActivityItem[]>(
              scope.mine
                ? "/dashboard/activity/?mine=true"
                : scope.currentProjects
                  ? "/dashboard/activity/?current_projects=true"
                  : scopedPath("/dashboard/activity/", scope),
              {
                signal: api.signal,
              },
            ),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Tasks"],
    }),
  }),
});

export const { useDeliveryQuery, useActivityQuery } = dashboardQueries;
