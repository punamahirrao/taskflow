import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
}
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("sessionStorage", storage());
  vi.stubGlobal("window", { dispatchEvent: vi.fn(), location: { href: "" } });
  sessionStorage.setItem("access_token", "expired");
  sessionStorage.setItem("refresh_token", "refresh");
  sessionStorage.setItem("active_organization_id", "7");
});
afterEach(() => vi.unstubAllGlobals());

describe("session handling", () => {
  it("shares one refresh between simultaneous expired requests", async () => {
    let refreshes = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, options: RequestInit) => {
        if (url.includes("token/refresh")) {
          refreshes++;
          return Response.json({ access: "fresh" });
        }
        const headers = new Headers(options.headers);
        expect(headers.get("X-Organization-ID")).toBe("7");
        return headers.get("Authorization") === "Bearer fresh"
          ? Response.json({ ok: true })
          : new Response("", { status: 401 });
      }),
    );
    const { apiFetch } = await import("./client");
    const responses = await Promise.all([
      apiFetch("/tasks/"),
      apiFetch("/projects/"),
      apiFetch("/documents/"),
    ]);
    expect(refreshes).toBe(1);
    expect(responses).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
  });

  it("preserves credentials when refresh has a temporary server failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string) =>
          new Response("", { status: url.includes("token/refresh") ? 503 : 401 }),
      ),
    );
    const { apiFetch } = await import("./client");
    await expect(apiFetch("/tasks/")).rejects.toThrow("temporarily unavailable");
    expect(sessionStorage.getItem("refresh_token")).toBe("refresh");
    expect(window.location.href).toBe("");
  });

  it("clears a rejected session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 401 })),
    );
    const { apiFetch } = await import("./client");
    await expect(apiFetch("/tasks/")).rejects.toThrow();
    expect(sessionStorage.getItem("refresh_token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("keeps field validation errors readable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ related_tasks: ["Choose another task."] }, { status: 400 }),
      ),
    );
    const { apiFetch } = await import("./client");
    await expect(apiFetch("/tasks/1/", { method: "PATCH" })).rejects.toThrow(
      "related_tasks: Choose another task.",
    );
  });

  it("explains nested validation failures in editable AI proposals", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { epics: [{ stories: [{ points: ["Use a non-negative estimate."] }] }] },
          { status: 400 },
        ),
      ),
    );
    const { apiFetch } = await import("./client");
    await expect(
      apiFetch("/api/ai-estimator/v1/runs/run/stories/", { method: "POST" }),
    ).rejects.toThrow("epics.0.stories.0.points: Use a non-negative estimate.");
  });
});
