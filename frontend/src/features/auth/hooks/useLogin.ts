import { useState } from "react";
import { login } from "../../../api/auth";
import type { User } from "../../../entities/user";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(email: string, password: string, accountType: User["account_type"] = "private") {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return false;
    }
    setLoading(true);
    try {
      const needsProfileCompletion = await login(email, password, accountType);
      return needsProfileCompletion ? "/profile" : "/dashboard";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, submit };
}
