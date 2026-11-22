import { apiFetch } from "../../common/api/client";
import { queryApi, type DataScope } from "../../common/api/queryApi";
import type { Task } from "../../features/tasks/entities/task";

const myWorkApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    myTasks: builder.query<Task[], DataScope>({
      async queryFn(_scope, api) {
        try {
          return { data: await apiFetch<Task[]>("/tasks/?mine=true", { signal: api.signal }) };
        } catch (cause) {
          return {
            error: {
              message: cause instanceof Error ? cause.message : "Could not load your tasks.",
            },
          };
        }
      },
      providesTags: ["Tasks"],
    }),
  }),
});

export const { useMyTasksQuery, util: myWorkCache } = myWorkApi;
