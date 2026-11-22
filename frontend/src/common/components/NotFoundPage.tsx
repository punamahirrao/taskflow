import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-lg p-8">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
      <p className="my-4">This address does not match a Taskflow page.</p>
      <Link className="text-accent underline" to="/dashboard">
        Go to dashboard
      </Link>
    </main>
  );
}
