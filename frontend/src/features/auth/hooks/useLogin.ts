import { useState } from "react";
import { login } from "../../../api/auth";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(email: string, password: string) {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return false;
    }
    setLoading(true);
    try {
      await login(email, password);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, submit };
}
