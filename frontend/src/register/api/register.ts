import { apiFetch } from "../../common/api/client";

export async function register(email: string, jobTitle: string, password: string, confirmPassword: string): Promise<void> {
  await apiFetch("/accounts/register/", {
    method: "POST",
    body: JSON.stringify({ email, job_title: jobTitle, password, confirm_password: confirmPassword }),
  });
}
