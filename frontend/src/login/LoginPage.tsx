import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CredentialResponse } from "@react-oauth/google";
import { LoginForm } from "./components/LoginForm";
import { useLogin } from "./features/auth/hooks/useLogin";
import { isMicrosoftConfigured, signInWithMicrosoft } from "./features/auth/microsoft";
import { googleLogin } from "./api/auth";
import {
  AuthPromoSection,
  AuthFooter,
  AuthPage,
  AuthContent,
  AuthBrand,
} from "../common/sections/auth";
import TaskflowLogo from "../common/components/TaskflowLogo";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import type { AccountType } from "./entities/login";
import { useToast } from "../common/features/notifications/useToast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
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
      const message = cause instanceof Error ? cause.message : t("login.googleFailed");
      setSocialError(message);
      toast("error", message);
    }
  }

  async function handleMicrosoft() {
    setSocialError("");
    try {
      const needsProfileCompletion = await signInWithMicrosoft();
      navigate(needsProfileCompletion ? "/profile" : "/dashboard");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("login.microsoftFailed");
      setSocialError(message);
      toast("error", message);
    }
  }

  function handleOrganizationSSO() {
    setSocialError(t("login.orgSsoNotConfigured"));
    toast("info", t("login.orgSsoNotConfigured"));
  }

  return (
    <AuthPage>
      <AuthPromoSection />
      <AuthContent>
        <AuthBrand>
          <TaskflowLogo />
        </AuthBrand>
        <div
          className="mb-3 grid w-full max-w-md grid-cols-2 rounded-xl border border-gray-200 bg-white p-1"
          role="tablist"
          aria-label={t("login.chooseAccountType")}
        >
          <button
            id="private-login-tab"
            type="button"
            role="tab"
            aria-selected={accountType === "private"}
            aria-controls="login-panel"
            onClick={() => selectAccountType("private")}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${accountType === "private" ? "bg-indigo-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            {t("login.privateUser")}
          </button>
          <button
            id="organization-login-tab"
            type="button"
            role="tab"
            aria-selected={accountType === "organization"}
            aria-controls="login-panel"
            onClick={() => selectAccountType("organization")}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${accountType === "organization" ? "bg-indigo-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            {t("login.organizationUser")}
          </button>
        </div>
        <div
          role="tabpanel"
          aria-labelledby={
            accountType === "private" ? "private-login-tab" : "organization-login-tab"
          }
          className="w-full max-w-md"
        >
          <LoginForm
            accountType={accountType}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error || socialError}
            loading={loading}
            microsoftConfigured={isMicrosoftConfigured}
            onSubmit={handleSubmit}
            onGoogle={handleGoogle}
            onGoogleError={() => setSocialError(t("login.googleCancelled"))}
            onMicrosoft={handleMicrosoft}
            onOrganizationSSO={handleOrganizationSSO}
          />
        </div>
        <AuthFooter />
      </AuthContent>
    </AuthPage>
  );
}
