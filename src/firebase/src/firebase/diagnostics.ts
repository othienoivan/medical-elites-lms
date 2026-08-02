import { collection, getDocs, limit, query } from "firebase/firestore";

import { auth, db, storage } from "../config/firebase";
import { generateAiResponse } from "./aiAssistant";

export type DiagnosticStatus = "healthy" | "warning" | "error";

export type DiagnosticCheck = {
  id: string;
  label: string;
  status: DiagnosticStatus;
  detail: string;
  durationMs: number;
};

async function timedCheck(
  id: string,
  label: string,
  check: () => Promise<{ status?: DiagnosticStatus; detail: string }>
): Promise<DiagnosticCheck> {
  const startedAt = performance.now();

  try {
    const result = await check();
    return {
      id,
      label,
      status: result.status ?? "healthy",
      detail: result.detail,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      id,
      label,
      status: "error",
      detail: error instanceof Error ? error.message : "Unknown diagnostic error",
      durationMs: Math.round(performance.now() - startedAt),
    };
  }
}

export async function runCoreDiagnostics(): Promise<DiagnosticCheck[]> {
  return Promise.all([
    timedCheck("auth", "Authentication", async () => ({
      status: auth.currentUser ? "healthy" : "warning",
      detail: auth.currentUser
        ? `Authenticated as ${auth.currentUser.email || auth.currentUser.uid}`
        : "No authenticated user detected.",
    })),
    timedCheck("firestore", "Firestore", async () => {
      const snapshot = await getDocs(query(collection(db, "users"), limit(1)));
      return {
        detail: `Connected successfully. ${snapshot.size} sample user record read.`,
      };
    }),
    timedCheck("storage", "Firebase Storage", async () => {
      const bucket = storage.app.options.storageBucket;
      return {
        status: bucket ? "healthy" : "warning",
        detail: bucket
          ? `Storage configured for ${bucket}. File-level access is verified during uploads and previews.`
          : "No Firebase Storage bucket is configured.",
      };
    }),
    timedCheck("network", "Network", async () => ({
      status: navigator.onLine ? "healthy" : "warning",
      detail: navigator.onLine
        ? "Browser reports an active network connection."
        : "Browser is offline; cached features may still work.",
    })),
    timedCheck("service-worker", "Offline / PWA", async () => {
      if (!("serviceWorker" in navigator)) {
        return { status: "warning", detail: "Service workers are not supported by this browser." };
      }
      const registration = await navigator.serviceWorker.getRegistration();
      return {
        status: registration ? "healthy" : "warning",
        detail: registration
          ? "Service worker is registered."
          : "No active service worker registration was found.",
      };
    }),
  ]);
}

export async function runMediDiagnostic(): Promise<DiagnosticCheck> {
  return timedCheck("medi", "Medi AI", async () => {
    const response = await generateAiResponse({
      mode: "tutor_lesson",
      prompt: "Reply with exactly: MEDI_OK",
      context: "This is an automated platform health check. Do not provide additional text.",
    });

    return {
      status: response.text ? "healthy" : "warning",
      detail: response.text
        ? `Medi responded successfully using ${response.model || "the configured model"}.`
        : "Medi responded without content.",
    };
  });
}
