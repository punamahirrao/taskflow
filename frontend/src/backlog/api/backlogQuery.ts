import { queryApi, queryError, type DataScope } from "../../common/api/queryApi";
import { getBacklogTasks } from "./backlog";
import type { Task } from "../../features/tasks/entities/task";

export const backlogQuery = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    backlogTasks: builder.query<Task[], DataScope>({
      async queryFn(args, api) {
        try {
          return { data: await getBacklogTasks(args.projectId, api.signal) };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Tasks"],
    }),
  }),
});

export const { useBacklogTasksQuery } = backlogQuery;
