import { http, HttpResponse } from "msw";
import { mockUser, mockUsers } from "../users";

export const userHandlers = [
  http.get("*/accounts/profile/", () => HttpResponse.json(mockUser)),
  http.get("*/accounts/users/", () => HttpResponse.json(mockUsers)),
  http.post("*/accounts/users/", async ({ request }) =>
    HttpResponse.json(
      { ...mockUser, ...((await request.json()) as object), id: Date.now() },
      { status: 201 },
    ),
  ),
  http.put("*/accounts/users/:userId/", async ({ params, request }) =>
    HttpResponse.json({
      ...mockUser,
      ...((await request.json()) as object),
      id: Number(params.userId),
    }),
  ),
  http.patch("*/accounts/users/:userId/", async ({ params, request }) =>
    HttpResponse.json({
      ...mockUser,
      ...((await request.json()) as object),
      id: Number(params.userId),
    }),
  ),
  http.delete("*/accounts/users/:userId/", () => new HttpResponse(null, { status: 204 })),
];
