import type { FormEvent } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Link } from "react-router-dom";
import type { AccountType } from "../entities/login";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import LoginCredentialField from "./LoginCredentialField";
import {
  LoginAlternative,
  LoginError,
  LoginFormElement,
  LoginHeading,
  LoginMicrocopy,
  LoginMicrosoftButton,
  LoginMicrosoftContent,
  LoginOrgButton,
  LoginOrgSection,
  LoginPanel,
  LoginSocialStack,
  LoginSubmitButton,
  LoginSubtitle,
  LoginTerms,
  LoginTermsLink,
  LoginForgotButton,
} from "../Login.styles";

interface LoginFormProps {
  accountType: AccountType;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  loading: boolean;
  microsoftConfigured: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogle: (response: CredentialResponse) => void;
  onGoogleError: () => void;
  onMicrosoft: () => void;
  onOrganizationSSO: () => void;
}

export function LoginForm({ accountType, email, setEmail, password, setPassword, error, loading, microsoftConfigured, onSubmit, onGoogle, onGoogleError, onMicrosoft, onOrganizationSSO }: LoginFormProps) {
  const { t } = useTranslation();
  const isOrganization = accountType === "organization";

  return <LoginPanel data-testid="login-panel">
    <LoginHeading>{isOrganization ? t("login.organizationTitle") : t("login.welcomeTitle")}</LoginHeading>
    <LoginSubtitle>{isOrganization ? t("login.organizationSubtitle") : t("login.welcomeSubtitle")}</LoginSubtitle>
    <LoginFormElement data-testid="login-form" onSubmit={onSubmit}>
      <LoginCredentialField id="login-email" testId="login-email" label={t("login.emailAddress")} type="email" autoComplete="username" value={email} onChange={setEmail} />
      <LoginCredentialField id="login-password" testId="login-password" label={t("login.password")} type="password" autoComplete="current-password" value={password} onChange={setPassword} />
      <LoginForgotButton type="button" disabled title={t("login.comingSoon")}>{t("login.forgotPassword")}</LoginForgotButton>
      {error && <LoginError role="alert">{error}</LoginError>}
      <LoginSubmitButton data-testid="login-submit" type="submit" disabled={loading}>{loading ? t("login.signingIn") : t("login.signIn")}</LoginSubmitButton>
    </LoginFormElement>

    {isOrganization ? <LoginOrgSection>
      <LoginOrgButton data-testid="organization-sso" type="button" disabled={loading} onClick={onOrganizationSSO}>{t("login.continueOrgSso")}</LoginOrgButton>
    </LoginOrgSection> : <>
      <LoginAlternative>{t("login.orContinueWith")}</LoginAlternative>
      <LoginSocialStack>
        <GoogleLogin logo_alignment="center" onSuccess={onGoogle} onError={onGoogleError} />
        <LoginMicrosoftButton data-testid="microsoft-signin" type="button" disabled={!microsoftConfigured || loading} onClick={onMicrosoft} title={microsoftConfigured ? "" : t("login.microsoftEnableHint")}>
          <LoginMicrosoftContent><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="#f25022" d="M1 1h10v10H1z" /><path fill="#7fba00" d="M13 1h10v10H13z" /><path fill="#00a4ef" d="M1 13h10v10H1z" /><path fill="#ffb900" d="M13 13h10v10H13z" /></svg>{t("login.continueMicrosoft")}</LoginMicrosoftContent>
        </LoginMicrosoftButton>
        {!microsoftConfigured && <LoginMicrocopy>{t("login.microsoftNeedsClientId")}</LoginMicrocopy>}
      </LoginSocialStack>
    </>}
    {!isOrganization && <LoginTerms>{t("login.termsNotice")}<LoginTermsLink as={Link} data-testid="register-link" to="/register">{t("login.register")}</LoginTermsLink></LoginTerms>}
  </LoginPanel>;
}
