import "./login.css";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CredentialResponse } from "@react-oauth/google";
import { LoginForm } from "./features/auth/components/LoginForm";
import { useLogin } from "./features/auth/hooks/useLogin";
import { isMicrosoftConfigured, signInWithMicrosoft } from "./features/auth/microsoft";
import { googleLogin } from "../common/api/auth";
import { AuthPromoSection } from "../common/sections/auth/AuthPromoSection";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import type { AccountType } from "./entities/login";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState<AccountType>("private");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [socialError, setSocialError] = useState("");
  const { error, loading, setError, submit } = useLogin();

  function selectAccountType(type: AccountType) {
    setAccountType(type);
    setSocialError("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = await submit(email, password, accountType);
    if (destination) navigate(destination);
  }

  async function handleGoogle(response: CredentialResponse) {
    try {
      if (!response.credential) throw new Error(t("login.googleNoCredential"));
      const needsProfileCompletion = await googleLogin(response.credential);
      navigate(needsProfileCompletion ? "/profile" : "/dashboard");
    } catch (cause) {
      setSocialError(cause instanceof Error ? cause.message : t("login.googleFailed"));
    }
  }

  async function handleMicrosoft() {
    setSocialError("");
    try {
      const needsProfileCompletion = await signInWithMicrosoft();
      navigate(needsProfileCompletion ? "/profile" : "/dashboard");
    } catch (cause) {
      setSocialError(cause instanceof Error ? cause.message : t("login.microsoftFailed"));
    }
  }

  function handleOrganizationSSO() {
    setSocialError(t("login.orgSsoNotConfigured"));
  }

  return <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <AuthPromoSection />
    <section className="flex flex-col items-center justify-center overflow-hidden bg-gray-50 px-6 py-8">
      <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900 text-xl text-white">✈</span><span className="text-3xl font-bold text-indigo-900">{t("app.taskflow")}</span></div>
      <div className="mb-3 grid w-full max-w-md grid-cols-2 rounded-xl border border-gray-200 bg-white p-1" role="tablist" aria-label={t("login.chooseAccountType")}>
        <button id="private-login-tab" type="button" role="tab" aria-selected={accountType === "private"} aria-controls="login-panel" onClick={() => selectAccountType("private")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${accountType === "private" ? "bg-indigo-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>{t("login.privateUser")}</button>
        <button id="organization-login-tab" type="button" role="tab" aria-selected={accountType === "organization"} aria-controls="login-panel" onClick={() => selectAccountType("organization")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${accountType === "organization" ? "bg-indigo-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>{t("login.organizationUser")}</button>
      </div>
      <div role="tabpanel" aria-labelledby={accountType === "private" ? "private-login-tab" : "organization-login-tab"} className="w-full max-w-md">
        <LoginForm accountType={accountType} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error || socialError} loading={loading} microsoftConfigured={isMicrosoftConfigured} onSubmit={handleSubmit} onGoogle={handleGoogle} onGoogleError={() => setSocialError(t("login.googleCancelled"))} onMicrosoft={handleMicrosoft} onOrganizationSSO={handleOrganizationSSO} />
      </div>
    </section>
  </main>;
}
