import { http, HttpResponse } from "msw";
import type { ReleaseDirectory } from "../../releases/entities/release";
import { mockReleaseDirectory } from "../releases";
import { mockUser } from "../users";

export const releaseHandlers = [
  http.get("*/projects/releases/", ({ request }) => {
    const mine = new URL(request.url).searchParams.get("mine") === "true";
    const data: ReleaseDirectory = mine
      ? {
          ...mockReleaseDirectory,
          items: mockReleaseDirectory.items.filter((item) =>
            item.steps.some((step) => step.approver_id === mockUser.id),
          ),
          members: [],
          goals: [],
        }
      : mockReleaseDirectory;
    return HttpResponse.json(data);
  }),
];
