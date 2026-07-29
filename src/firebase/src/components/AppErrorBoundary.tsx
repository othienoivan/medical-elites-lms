import { Component, type ErrorInfo, type ReactNode } from "react";

import Button from "./ui/Button";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "An unexpected application error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught application error:", error, info);
  }

  private reload = () => window.location.reload();
  private goHome = () => window.location.assign("/");

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
        <section className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Something went wrong
          </h1>
          <p className="mt-3 text-slate-600">
            Medical Elites LMS could not finish loading this page. Your saved
            data has not been intentionally deleted.
          </p>
          {import.meta.env.DEV && this.state.message && (
            <pre className="mt-5 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-slate-100">
              {this.state.message}
            </pre>
          )}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={this.reload}>Reload page</Button>
            <Button variant="outline" onClick={this.goHome}>
              Return home
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
