import type { FormEvent } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Link } from "react-router-dom";
import type { AccountType } from "../../../entities/login";
import { useTranslation } from "../../../../common/shared/i18n/hooks/useTranslation";

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

  return <div data-testid="login-panel" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
    <h1 className="text-center text-xl font-bold text-gray-900">{isOrganization ? t("login.organizationTitle") : t("login.welcomeTitle")}</h1>
    <p className="mb-4 mt-1 text-center text-sm text-gray-600">{isOrganization ? t("login.organizationSubtitle") : t("login.welcomeSubtitle")}</p>
    <form data-testid="login-form" className="space-y-3" onSubmit={onSubmit}>
      <label className="flex flex-col text-sm font-bold text-gray-900">{t("login.emailAddress")}<input data-testid="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
      <label className="flex flex-col text-sm font-bold text-gray-900">{t("login.password")}<input data-testid="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
      <button type="button" disabled title={t("login.comingSoon")} className="text-sm text-gray-500">{t("login.forgotPassword")}</button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button data-testid="login-submit" type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-900 py-2.5 font-medium text-white hover:bg-indigo-800 disabled:opacity-70">{loading ? t("login.signingIn") : t("login.signIn")}</button>
    </form>

    {isOrganization ? <div className="mt-5 border-t border-gray-200 pt-5">
      <button data-testid="organization-sso" type="button" disabled={loading} onClick={onOrganizationSSO} className="w-full rounded-lg border border-indigo-200 bg-white py-2.5 font-medium text-indigo-900 hover:bg-indigo-50 disabled:opacity-60">{t("login.continueOrgSso")}</button>
    </div> : <>
      <div className="my-4 flex items-center gap-3 text-xs text-gray-500"><span className="flex-1 border-t border-gray-300" />{t("login.orContinueWith")}<span className="flex-1 border-t border-gray-300" /></div>
      <div className="space-y-2">
        <GoogleLogin logo_alignment="center" onSuccess={onGoogle} onError={onGoogleError} />
        <button data-testid="microsoft-signin" type="button" disabled={!microsoftConfigured || loading} onClick={onMicrosoft} title={microsoftConfigured ? "" : t("login.microsoftEnableHint")} className="w-full rounded-lg bg-sky-600 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
          <span className="inline-flex items-center justify-center gap-2"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="#f25022" d="M1 1h10v10H1z" /><path fill="#7fba00" d="M13 1h10v10H13z" /><path fill="#00a4ef" d="M1 13h10v10H1z" /><path fill="#ffb900" d="M13 13h10v10H13z" /></svg>{t("login.continueMicrosoft")}</span>
        </button>
        {!microsoftConfigured && <p className="text-xs text-gray-500">{t("login.microsoftNeedsClientId")}</p>}
      </div>
    </>}
    {!isOrganization && <p className="mt-4 text-center text-xs text-gray-500">{t("login.termsNotice")}<Link data-testid="register-link" to="/register" className="font-bold text-indigo-900 hover:underline">{t("login.register")}</Link></p>}
  </div>;
}
