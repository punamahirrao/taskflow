import { tasksQuery } from "../../features/tasks/api/tasksQuery";
import { documentsQuery } from "../../documents/api/documentsQuery";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { queryApi, type DataScope } from "./queryApi";

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());
const scope: DataScope = { organizationId: "advirid", userId: "punam", projectId: null };
const library = (name: string) => ({ folders: [], documents: [{ id: name, name }], links: [] });
function testStore() {
  return configureStore({
    reducer: { [queryApi.reducerPath]: queryApi.reducer },
    middleware: (defaults) => defaults().concat(queryApi.middleware),
  });
}

it("keeps an old project response separate from the newly selected private library", async () => {
  const store = testStore();
  let release!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      url.includes("project_id=101")
        ? new Promise<Response>((resolve) => {
            release = resolve;
          })
        : Promise.resolve(Response.json(library("private-file"))),
    ),
  );
  const projectArgs = { ...scope, location: 101 as const, folderId: null };
  const privateArgs = { ...scope, location: "personal" as const, folderId: null };
  const project = store.dispatch(documentsQuery.endpoints.documents.initiate(projectArgs));
  const personal = store.dispatch(documentsQuery.endpoints.documents.initiate(privateArgs));
  await personal.unwrap();
  release(Response.json(library("project-file")));
  await project.unwrap();
  expect(
    documentsQuery.endpoints.documents.select(privateArgs)(store.getState()).data?.documents[0]
      .name,
  ).toBe("private-file");
  project.unsubscribe();
  personal.unsubscribe();
  store.dispatch(queryApi.util.resetApiState());
});

it("separates user and organization cache keys and resets them on logout", async () => {
  const store = testStore();
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      calls++;
      return Response.json([]);
    }),
  );
  const first = { ...scope, activeSprintOnly: false, boardId: null };
  const second = { ...first, organizationId: "sandbox" };
  const third = { ...first, userId: "other-user" };
  const queries = [first, second, third].map((args) =>
    store.dispatch(tasksQuery.endpoints.tasks.initiate(args)),
  );
  await Promise.all(queries.map((query) => query.unwrap()));
  expect(calls).toBe(3);
  store.dispatch(queryApi.util.resetApiState());
  expect(tasksQuery.endpoints.tasks.select(first)(store.getState()).isUninitialized).toBe(true);
  queries.forEach((query) => query.unsubscribe());
});

it("normal sign-out clears credentials and the application query cache", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json([])),
  );
  const { store } = await import("../store");
  const { clearAuthSession } = await import("../store/auth");
  sessionStorage.setItem("access_token", "access");
  sessionStorage.setItem("refresh_token", "refresh");
  const args = { ...scope, activeSprintOnly: false, boardId: null };
  const query = store.dispatch(tasksQuery.endpoints.tasks.initiate(args));
  await query.unwrap();
  query.unsubscribe();
  clearAuthSession();
  expect(sessionStorage.getItem("access_token")).toBeNull();
  expect(tasksQuery.endpoints.tasks.select(args)(store.getState()).isUninitialized).toBe(true);
});
