import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../features/auth/hooks/useLogin";
import { LoginForm } from "../features/auth/components/LoginForm";
import { AuthPromoSection } from "../sections/auth/AuthPromoSection";
import { googleLogin } from "../api/auth";
import type { CredentialResponse } from '@react-oauth/google';

  
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, loading, submit } = useLogin();
  const [googleError, setGoogleError] = useState(""); 

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await submit(email, password)) navigate("/dashboard");
  }
  
  async function handleGoogle(response: CredentialResponse) {
    try {
    if (!response.credential) throw new Error();
    await googleLogin(response.credential);
    navigate("/dashboard");
  } catch {
    setGoogleError("Google sign-in failed. Please try again.");
  }
}
  return <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <AuthPromoSection />
    <section className="flex flex-col items-center justify-center overflow-hidden bg-gray-50 px-6 py-4">
      <div className="mb-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900 text-xl text-white">✈</span><span className="text-3xl font-bold text-indigo-900">TaskFlow</span></div>
      <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error || googleError} loading={loading} onSubmit={handleSubmit} onGoogle={handleGoogle} onGoogleError={() => setGoogleError("Google sign-in failed. Please try again.")} />
    </section>
  </main>;
}
