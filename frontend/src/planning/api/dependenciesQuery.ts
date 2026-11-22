import { queryApi, queryResult } from "../../common/api/queryApi";
import { updateTask } from "../../features/tasks/api/tasks";
import type { Task } from "../../features/tasks/entities/task";

const dependenciesQuery = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    saveDependencies: builder.mutation<Task, { taskId: number; blockedBy: number[] }>({
      queryFn: ({ taskId, blockedBy }) =>
        queryResult(updateTask(taskId, { blocked_by: blockedBy })),
      invalidatesTags: ["Tasks", "Planning", "Audit"],
    }),
  }),
});

export const { useSaveDependenciesMutation } = dependenciesQuery;
