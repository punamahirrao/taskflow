import { http, HttpResponse } from "msw";

export const registrationHandlers = [
  http.post("*/accounts/register/", async ({ request }) => {
    const data = (await request.json()) as { organization_name?: string };
    if (!data.organization_name?.trim())
      return HttpResponse.json(
        { organization_name: ["An organization name is required."] },
        { status: 400 },
      );
    return HttpResponse.json({ message: "Account created." }, { status: 201 });
  }),
];
