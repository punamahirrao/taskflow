import { useState } from "react";
import { login } from "../../../../common/api/auth";
import { translate } from "../../../../common/shared/i18n/translate";
import type { LoginState } from "../../../entities/login";
import type { User } from "../../../../common/entities/user";

export function useLogin(): LoginState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(email: string, password: string, accountType: User["account_type"] = "private") {
    setError("");
    if (!email || !password) {
      setError(translate("login.errorEnterBoth"));
      return false;
    }
    setLoading(true);
    try {
      const needsProfileCompletion = await login(email, password, accountType);
      return needsProfileCompletion ? "/profile" : "/dashboard";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("login.errorFailed"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, submit };
}
