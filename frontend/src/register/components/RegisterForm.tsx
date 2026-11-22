import { useState, type FormEvent } from "react";
import type { RegisterValues } from "../entities/register";
import { Link } from "react-router-dom";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import {
  AuthField,
  AuthError,
  AuthFormElement,
  AuthSubmitButton,
} from "../../common/sections/auth";

interface RegisterFormProps {
  error: string;
  loading: boolean;
  onSubmit: (values: RegisterValues) => void;
}

export default function RegisterForm({ error, loading, onSubmit }: RegisterFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<RegisterValues>({
    email: "",
    jobTitle: "",
    organizationName: "",
    password: "",
    confirmPassword: "",
  });
  function update(field: keyof RegisterValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <>
      <AuthFormElement data-testid="register-form" onSubmit={handleSubmit}>
        <AuthField
          id="register-email"
          testId="register-email"
          label={t("register.emailAddress")}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(value) => update("email", value)}
        />
        <AuthField
          id="register-job-title"
          testId="register-job-title"
          label={t("register.jobTitle")}
          type="text"
          autoComplete="organization-title"
          value={values.jobTitle}
          onChange={(value) => update("jobTitle", value)}
          required
          maxLength={100}
        />
        <AuthField
          id="register-organization-name"
          testId="register-organization-name"
          label={t("register.organizationName")}
          type="text"
          autoComplete="organization"
          value={values.organizationName}
          onChange={(value) => update("organizationName", value)}
          required
          maxLength={100}
        />
        <AuthField
          id="register-password"
          testId="register-password"
          label={t("register.password")}
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(value) => update("password", value)}
        />
        <AuthField
          id="register-confirm-password"
          testId="register-confirm-password"
          label={t("register.confirmPassword")}
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(value) => update("confirmPassword", value)}
        />
        {error && <AuthError role="alert">{error}</AuthError>}
        <AuthSubmitButton data-testid="register-submit" type="submit" disabled={loading}>
          {loading ? t("register.creatingAccount") : t("register.createAccount")}
        </AuthSubmitButton>
      </AuthFormElement>
      <p className="mt-4 text-center text-xs text-gray-500">
        {t("register.haveAccount")}
        <Link to="/login" className="font-bold text-indigo-900 hover:underline">
          {t("register.logIn")}
        </Link>
      </p>
    </>
  );
}
