export type AppDiagnosticError = {
  id: string;
  message: string;
  source: string;
  occurredAt: string;
  stack?: string;
};

const STORAGE_KEY = "medical-elites-diagnostic-errors";
const MAX_ERRORS = 50;

function readErrors(): AppDiagnosticError[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppDiagnosticError[]) : [];
  } catch {
    return [];
  }
}

export function getDiagnosticErrors(): AppDiagnosticError[] {
  if (typeof window === "undefined") return [];
  return readErrors();
}

export function clearDiagnosticErrors(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function recordDiagnosticError(
  error: unknown,
  source = "application"
): void {
  if (typeof window === "undefined") return;

  const normalized =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error), stack: undefined };

  const entry: AppDiagnosticError = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message: normalized.message,
    source,
    occurredAt: new Date().toISOString(),
    stack: normalized.stack,
  };

  const next = [entry, ...readErrors()].slice(0, MAX_ERRORS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function installGlobalDiagnosticsListeners(): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onError = (event: ErrorEvent) => {
    recordDiagnosticError(event.error ?? event.message, "window.error");
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    recordDiagnosticError(event.reason, "unhandledrejection");
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
