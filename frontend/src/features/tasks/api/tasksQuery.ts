import { queryApi, queryError, type DataScope } from "../../../common/api/queryApi";
import { getTasks } from "./tasks";
import type { Task } from "../entities/task";

export const tasksQuery = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    tasks: builder.query<Task[], DataScope & { activeSprintOnly: boolean; boardId: number | null }>(
      {
        async queryFn(args, api) {
          try {
            return {
              data: await getTasks(
                args.projectId,
                args.activeSprintOnly ? "active" : null,
                args.boardId,
                api.signal,
              ),
            };
          } catch (cause) {
            return queryError(cause);
          }
        },
        providesTags: ["Tasks"],
      },
    ),
  }),
});

export const { useTasksQuery } = tasksQuery;
