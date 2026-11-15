import { useState } from "react";
import { register } from "../../../api/register";
import { translate } from "../../../../common/shared/i18n/translate";
import type { RegisterState } from "../../../entities/register";
import { firstValidationError, registerSchema } from "../../../../common/validation/schemas";
import { useToast } from "../../../../common/features/notifications/useToast";

export function useRegister(): RegisterState {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(email: string, jobTitle: string, password: string, confirmPassword: string) {
    setError("");
    const validationError = firstValidationError(registerSchema, { email, jobTitle, password, confirmPassword });
    if (validationError) {
      setError(validationError); toast("error", validationError);
      return false;
    }
    setLoading(true);
    try {
      await register(email, jobTitle.trim(), password, confirmPassword);
      toast("success", translate("register.createdToast"));
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : translate("register.errorFailed");
      setError(message); toast("error", message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, submit };
}
