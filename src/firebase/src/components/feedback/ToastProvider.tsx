/* eslint-disable react-refresh/only-export-components */
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

export type ToastTone = "success" | "error" | "warning" | "info";

type ToastInput = {
  message: string;
  title?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = Required<Pick<ToastInput, "message" | "tone" | "durationMs">> & {
  id: number;
  title?: string;
};

type ToastContextValue = {
  showToast: (input: ToastInput | string) => number;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 4_500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const originalAlert = useRef<typeof window.alert | null>(null);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput | string) => {
    const normalized = typeof input === "string" ? { message: input } : input;
    const id = nextId.current++;
    const tone = normalized.tone ?? inferTone(normalized.message);
    const durationMs = normalized.durationMs ?? DEFAULT_DURATION_MS;

    setToasts((current) => [
      ...current.slice(-3),
      {
        id,
        message: normalized.message,
        title: normalized.title,
        tone,
        durationMs,
      },
    ]);

    return id;
  }, []);

  useEffect(() => {
    originalAlert.current = window.alert;
    window.alert = (message?: unknown) => {
      showToast(String(message ?? ""));
    };

    return () => {
      if (originalAlert.current) {
        window.alert = originalAlert.current;
      }
    };
  }, [showToast]);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:w-[390px]"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.durationMs, toast.id]);

  const config = toneConfig[toast.tone];
  const Icon = config.icon;

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={`pointer-events-auto w-full overflow-hidden rounded-2xl border bg-white shadow-xl ${config.border}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 rounded-full p-1.5 ${config.iconWrap}`}>
          <Icon size={18} className={config.iconColor} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="font-bold text-slate-950">{toast.title}</p>
          )}
          <p className="text-sm leading-6 text-slate-700">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Dismiss notification"
        >
          <X size={17} />
        </button>
      </div>
      <div className={`h-1 ${config.progress}`} />
    </div>
  );
}

const toneConfig: Record<
  ToastTone,
  {
    icon: typeof Info;
    border: string;
    iconWrap: string;
    iconColor: string;
    progress: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-green-200",
    iconWrap: "bg-green-100",
    iconColor: "text-green-700",
    progress: "bg-green-500",
  },
  error: {
    icon: XCircle,
    border: "border-red-200",
    iconWrap: "bg-red-100",
    iconColor: "text-red-700",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertCircle,
    border: "border-amber-200",
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-800",
    progress: "bg-amber-500",
  },
  info: {
    icon: Info,
    border: "border-blue-200",
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-700",
    progress: "bg-blue-500",
  },
};

function inferTone(message: string): ToastTone {
  const value = message.toLowerCase();
  if (
    value.includes("failed") ||
    value.includes("error") ||
    value.includes("permission") ||
    value.includes("invalid") ||
    value.includes("could not")
  ) {
    return "error";
  }
  if (
    value.includes("warning") ||
    value.includes("required") ||
    value.includes("please select") ||
    value.includes("please enter") ||
    value.includes("cannot")
  ) {
    return "warning";
  }
  if (
    value.includes("success") ||
    value.includes("saved") ||
    value.includes("created") ||
    value.includes("updated") ||
    value.includes("sent") ||
    value.includes("recorded") ||
    value.includes("published") ||
    value.includes("deleted") ||
    value.includes("released")
  ) {
    return "success";
  }
  return "info";
}
