import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../features/auth/hooks/useRegister";
import { AuthPromoSection } from "../sections/auth/AuthPromoSection";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { error, loading, submit } = useRegister();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await submit(email, password, confirmPassword)) navigate("/login");
  }

  return <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <AuthPromoSection />
    <section className="flex flex-col items-center justify-center overflow-hidden bg-gray-50 px-6 py-4">
      <div className="mb-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900 text-xl text-white">✈</span><span className="text-3xl font-bold text-indigo-900">TaskFlow</span></div>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="text-center text-xl font-bold text-gray-900">Create your TaskFlow account</h1>
        <p className="mb-4 mt-1 text-center text-sm text-gray-600">Sign up to start planning and collaborating with your team.</p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="flex flex-col text-sm font-bold text-gray-900">Email Address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
          <label className="flex flex-col text-sm font-bold text-gray-900">Password<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
          <label className="flex flex-col text-sm font-bold text-gray-900">Confirm Password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-900 py-2.5 font-medium text-white hover:bg-indigo-800 disabled:opacity-70">{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">Already have an account? <Link to="/login" className="font-bold text-indigo-900 hover:underline">Log in</Link></p>
      </div>
    </section>
  </main>;
}
