import { http, HttpResponse } from "msw";
import { mockOrganizationDirectory } from "../organizations";

export const organizationHandlers = [
  http.get("*/accounts/organizations/", () => HttpResponse.json(mockOrganizationDirectory)),
];
