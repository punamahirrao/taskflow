import { apiFetch } from "../../common/api/client";
import { queryApi,queryError,type DataScope } from "../../common/api/queryApi";

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  kind: string;
  project_id: number | null;
}

export const calendarQuery = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    calendar: builder.query<CalendarItem[], DataScope & { start: string; end: string }>({
      async queryFn(args, api) {
        try {
          const params = new URLSearchParams({ start: args.start, end: args.end });
          if (args.projectId) params.set("project_id", String(args.projectId));
          return {
            data: await apiFetch<CalendarItem[]>(`/dashboard/calendar/?${params}`, {
              signal: api.signal,
            }),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Tasks"],
    }),
  }),
});

export const { useCalendarQuery } = calendarQuery;
