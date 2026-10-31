import type { FormEvent } from "react";
import { GoogleLogin,  type CredentialResponse} from '@react-oauth/google';
import { Link } from "react-router-dom";


export function LoginForm({ email, setEmail, password, setPassword, error, loading, onSubmit, onGoogle, onGoogleError }: {
  email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void;
  error: string; loading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogle: (response: CredentialResponse) => void; onGoogleError: () => void;
}) 
{
  return <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
    <h1 className="text-center text-xl font-bold text-gray-900">Welcome Back to TaskFlow</h1>
    <p className="mb-4 mt-1 text-center text-sm text-gray-600">Access your collaborative planning workspace for all your projects.</p>
    <form className="space-y-3" onSubmit={onSubmit}>
      <label className="flex flex-col text-sm font-bold text-gray-900">Email Address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
      <label className="flex flex-col text-sm font-bold text-gray-900">Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400" /></label>
      <button type="button" disabled title="Coming soon" className="text-sm text-gray-500">Forgot Password?</button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-900 py-2.5 font-medium text-white hover:bg-indigo-800 disabled:opacity-70">{loading ? "Signing in..." : "Sign In"}</button>
    </form>
    <div className="my-4 flex items-center gap-3 text-xs text-gray-500"><span className="flex-1 border-t border-gray-300" />OR CONTINUE WITH<span className="flex-1 border-t border-gray-300" /></div>
    <div className="space-y-2">
      <GoogleLogin onSuccess={onGoogle} onError={onGoogleError} />
      <button type="button" disabled title="Coming soon" className="w-full cursor-not-allowed rounded-lg bg-sky-600 py-2 text-sm font-medium text-white">⊞ Continue with Microsoft</button>
      <button type="button" disabled title="Coming soon" className="w-full cursor-not-allowed rounded-lg bg-blue-800 py-2 text-sm font-medium text-white">🔑 Corporate SSO Login</button>
    </div>
    <p className="mt-4 text-center text-xs text-gray-500">Terms of Service · Privacy Policy · Need an account? <Link to="/register" className="font-bold text-indigo-900 hover:underline">Register</Link></p>
  </div>;
}
