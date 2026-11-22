import { queryApi, queryResult, type DataScope } from "../../common/api/queryApi";
import { getAccessibleAgileBoards } from "../../features/tasks/api/boards";
import type { AgileBoard } from "../../features/tasks/entities/task";

interface BoardDirectory {
  active: AgileBoard[];
  archived: AgileBoard[];
}

export const boardsApi = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    boardDirectory: builder.query<BoardDirectory, DataScope>({
      queryFn: (_scope, { signal }) =>
        queryResult<BoardDirectory>(
          Promise.all([
            getAccessibleAgileBoards(false, signal),
            getAccessibleAgileBoards(true, signal),
          ]).then(([active, archived]) => ({ active, archived })),
        ),
    }),
  }),
});

export const { useBoardDirectoryQuery } = boardsApi;
