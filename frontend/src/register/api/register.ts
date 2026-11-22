import { apiFetch } from "../../common/api/client";

import type { RegisterValues } from "../entities/register";

export async function register({
  email,
  jobTitle,
  password,
  confirmPassword,
  organizationName,
}: RegisterValues) {
  await apiFetch("/accounts/register/", {
    method: "POST",
    body: JSON.stringify({
      email,
      job_title: jobTitle,
      organization_name: organizationName,
      password,
      confirm_password: confirmPassword,
    }),
  });
}
