import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DataScope {
  organizationId: string;
  userId: string;
  projectId: number | null;
}
export function dataScope(projectId: number | null = null): DataScope {
  let userId = "";
  try {
    userId = String(
      (JSON.parse(sessionStorage.getItem("user") ?? "{}") as { id?: number }).id ?? "",
    );
  } catch {
    /* An anonymous scope has no cached identity. */
  }
  return {
    organizationId: sessionStorage.getItem("active_organization_id") ?? "",
    userId,
    projectId,
  };
}
interface QueryError {
  message: string;
}
export function queryError(
  cause: unknown,
  fallback = "Could not load data.",
): { error: QueryError } {
  const message =
    typeof cause === "object" && cause !== null && "message" in cause ? cause.message : null;
  return { error: { message: typeof message === "string" && message ? message : fallback } };
}

export async function unwrapRequest<T>(request: { unwrap: () => Promise<T> }, fallback: string) {
  try {
    return await request.unwrap();
  } catch (cause) {
    throw new Error(queryError(cause, fallback).error.message, { cause });
  }
}

export async function queryResult<T>(
  request: Promise<T>,
): Promise<{ data: T } | { error: QueryError }> {
  try {
    return { data: await request };
  } catch (cause) {
    return queryError(cause);
  }
}
export function scopedPath(path: string, scope: DataScope) {
  return scope.projectId ? `${path}?project_id=${scope.projectId}` : path;
}

export const queryApi = createApi({
  reducerPath: "serverData",
  baseQuery: fakeBaseQuery<QueryError>(),
  tagTypes: ["Tasks", "Documents", "Planning", "Audit", "Usage", "Projects"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
