import { useState } from "react";
import { register } from "../../../api/auth";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(email: string, password: string, confirmPassword: string) {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setLoading(true);
    try {
      await register(email, password, confirmPassword);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, submit };
}
