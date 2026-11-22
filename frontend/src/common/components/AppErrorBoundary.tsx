import { Component, type ErrorInfo, type ReactNode } from "react";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Taskflow rendering failed", error, info.componentStack);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="mx-auto max-w-lg p-8">
          <h1 className="text-xl font-semibold">This page could not be displayed</h1>
          <p className="my-4">
            Reload Taskflow to try again. Your saved data is available on the server.
          </p>
          <button
            type="button"
            className="rounded bg-accent px-4 py-2 text-white"
            onClick={() => window.location.reload()}
          >
            Reload Taskflow
          </button>
          <a className="ml-4 text-accent" href="/dashboard">
            Open dashboard
          </a>
        </main>
      );
    return this.props.children;
  }
}
