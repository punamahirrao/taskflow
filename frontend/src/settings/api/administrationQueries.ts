import { queryApi, queryError, type DataScope } from "../../common/api/queryApi";
import { apiFetch } from "../../common/api/client";

export interface AuditRecord {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  actor: string;
  created_at: string;
}
export interface BillingUsage {
  organization: string;
  environment: string;
  billing_connected: boolean;
  users: number;
  projects: number;
  work_items: number;
  boards: number;
  storage_bytes: number;
}

export const administrationQueries = queryApi.injectEndpoints({
  endpoints: (builder) => ({
    billingUsage: builder.query<BillingUsage, DataScope>({
      async queryFn(_scope, api) {
        try {
          return {
            data: await apiFetch<BillingUsage>("/accounts/billing/usage/", { signal: api.signal }),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Usage"],
    }),
    audit: builder.query<
      { count: number; results: AuditRecord[] },
      DataScope & { page: number; search: string }
    >({
      async queryFn(args, api) {
        try {
          const params = new URLSearchParams({ page: String(args.page), q: args.search });
          return {
            data: await apiFetch<{ count: number; results: AuditRecord[] }>(
              `/accounts/audit/?${params}`,
              { signal: api.signal },
            ),
          };
        } catch (cause) {
          return queryError(cause);
        }
      },
      providesTags: ["Audit"],
    }),
  }),
});

export const { useBillingUsageQuery, useAuditQuery } = administrationQueries;
