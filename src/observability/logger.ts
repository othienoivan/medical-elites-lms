export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  domain: string;
  operation: string;
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface LogEntry extends LogContext {
  level: LogLevel;
  message: string;
  timestamp: string;
}

const redact = (value: unknown): unknown => {
  if (!value || typeof value !== "object") return value;
  const blocked = /password|secret|token|authorization|api[-_]?key/i;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, blocked.test(key) ? "[REDACTED]" : item]));
};

export function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function log(level: LogLevel, message: string, context: LogContext): LogEntry {
  const entry: LogEntry = {
    ...context,
    metadata: redact(context.metadata) as Record<string, unknown> | undefined,
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  const writer = level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.info;
  writer("[MedicalElites]", entry);
  return entry;
}

export async function measureOperation<T>(context: Omit<LogContext, "durationMs">, operation: () => Promise<T>): Promise<T> {
  const startedAt = performance.now();
  try {
    const result = await operation();
    log("info", "Operation completed", { ...context, durationMs: Math.round(performance.now() - startedAt) });
    return result;
  } catch (error) {
    log("error", "Operation failed", {
      ...context,
      durationMs: Math.round(performance.now() - startedAt),
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    throw error;
  }
}
