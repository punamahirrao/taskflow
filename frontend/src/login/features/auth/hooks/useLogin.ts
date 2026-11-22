import { useState } from "react";
import { login } from "../../../api/auth";
import { translate } from "../../../../common/shared/i18n/translate";
import type { LoginState } from "../../../entities/login";
import type { User } from "../../../../common/entities/user";
import { firstValidationError, loginSchema } from "../../../../common/validation/schemas";
import { useToast } from "../../../../common/features/notifications/useToast";

export function useLogin(): LoginState {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(
    email: string,
    password: string,
    accountType: User["account_type"] = "private",
  ) {
    setError("");
    const validationError = firstValidationError(loginSchema, { email, password });
    if (validationError) {
      setError(validationError);
      toast("error", validationError);
      return false;
    }
    setLoading(true);
    try {
      const needsProfileCompletion = await login(email, password, accountType);
      toast("success", translate("login.signedInToast"));
      return needsProfileCompletion ? "/profile" : "/dashboard";
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : translate("login.errorFailed");
      setError(message);
      toast("error", message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, submit };
}
