import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "./features/auth/hooks/useRegister";
import { AuthPromoSection } from "../common/sections/auth/AuthPromoSection";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { error, loading, submit } = useRegister();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await submit(email, jobTitle, password, confirmPassword)) navigate("/login");
  }

  return <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <AuthPromoSection />
    <section className="flex flex-col items-center justify-center overflow-hidden bg-gray-50 px-6 py-4">
      <div className="mb-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900 text-xl text-white">✈</span><span className="text-3xl font-bold       text-indigo-900">{t("app.taskflow")}</span></div>
      <div data-testid="register-panel" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="text-center text-xl font-bold text-gray-900"        >{t("register.title")}</h1>
                <p className="mb-4 mt-1 text-center text-sm text-gray-600">{t("register.subtitle")}</p>
        <RegisterForm email={email} onEmailChange={setEmail} jobTitle={jobTitle} onJobTitleChange={setJobTitle} password={password} onPasswordChange={setPassword} confirmPassword={confirmPassword} onConfirmPasswordChange={setConfirmPassword} error={error} loading={loading} onSubmit={handleSubmit} />
      </div>
    </section>
  </main>;
}
