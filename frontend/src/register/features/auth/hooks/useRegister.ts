import { useState } from "react";
import { register } from "../../../../common/api/auth";
import { translate } from "../../../../common/shared/i18n/translate";
import type { RegisterState } from "../../../entities/register";

export function useRegister(): RegisterState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(email: string, jobTitle: string, password: string, confirmPassword: string) {
    setError("");
    if (!email || !jobTitle.trim() || !password || !confirmPassword) {
      setError(translate("register.errorAllRequired"));
      return false;
    }
    if (password !== confirmPassword) {
      setError(translate("register.errorMismatch"));
      return false;
    }
    setLoading(true);
    try {
      await register(email, jobTitle.trim(), password, confirmPassword);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("register.errorFailed"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, submit };
}
