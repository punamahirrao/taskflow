import type { FormEventHandler } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import RegisterField from "./RegisterField";
import { RegisterError, RegisterFormElement, RegisterSubmitButton } from "../Register.styles";

interface RegisterFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  error: string;
  loading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function RegisterForm({
  email, onEmailChange, jobTitle, onJobTitleChange, password, onPasswordChange,
  confirmPassword, onConfirmPasswordChange, error, loading, onSubmit,
}: RegisterFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <RegisterFormElement data-testid="register-form" onSubmit={onSubmit}>
        <RegisterField id="register-email" testId="register-email" label={t("register.emailAddress")} type="email" autoComplete="email" value={email} onChange={onEmailChange} />
        <RegisterField id="register-job-title" testId="register-job-title" label={t("register.jobTitle")} type="text" autoComplete="organization-title" value={jobTitle} onChange={onJobTitleChange} required maxLength={100} />
        <RegisterField id="register-password" testId="register-password" label={t("register.password")} type="password" autoComplete="new-password" value={password} onChange={onPasswordChange} />
        <RegisterField id="register-confirm-password" testId="register-confirm-password" label={t("register.confirmPassword")} type="password" autoComplete="new-password" value={confirmPassword} onChange={onConfirmPasswordChange} />
        {error && <RegisterError role="alert">{error}</RegisterError>}
        <RegisterSubmitButton data-testid="register-submit" type="submit" disabled={loading}>
          {loading ? t("register.creatingAccount") : t("register.createAccount")}
        </RegisterSubmitButton>
      </RegisterFormElement>
      <p className="mt-4 text-center text-xs text-gray-500">
        {t("register.haveAccount")}<Link to="/login" className="font-bold text-indigo-900 hover:underline">{t("register.logIn")}</Link>
      </p>
    </>
  );
}
