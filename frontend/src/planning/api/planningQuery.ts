import { queryApi, queryError, type DataScope } from "../../common/api/queryApi";
import { getPlanningRecords, savePlanningRecord } from "./planning";
import type { PlanningRecord } from "../entities/planning";

export const planningQuery = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    planning: builder.query<
      { items: PlanningRecord[]; can_manage: boolean },
      DataScope & { kind: string }
    >({
      async queryFn(args, api) {
        try {
          return {
            data: await getPlanningRecords(args.kind, api.signal),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Planning"],
    }),
    savePlanning: builder.mutation<
      PlanningRecord,
      { id?: number; values: Omit<PlanningRecord, "id"> }
    >({
      async queryFn(args) {
        try {
          return {
            data: await savePlanningRecord(args.values, args.id),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      invalidatesTags: ["Planning", "Tasks", "Audit"],
    }),
  }),
});

export const { usePlanningQuery, useSavePlanningMutation } = planningQuery;
