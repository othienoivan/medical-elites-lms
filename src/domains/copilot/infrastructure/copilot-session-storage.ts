import type { CopilotMessage } from "../domain/copilot-models";

const STORAGE_KEY = "medical-elites-medi-copilot-messages-v1";
const MAX_MESSAGES = 20;

function isCopilotMessage(value: unknown): value is CopilotMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CopilotMessage>;
  return (
    typeof candidate.id === "string" &&
    (candidate.sender === "user" || candidate.sender === "medi") &&
    typeof candidate.text === "string" &&
    typeof candidate.createdAt === "number"
  );
}

export const CopilotSessionStorage = {
  load(): CopilotMessage[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter(isCopilotMessage).slice(-MAX_MESSAGES)
        : [];
    } catch {
      return [];
    }
  },

  save(messages: CopilotMessage[]): void {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_MESSAGES)),
      );
    } catch {
      // Session storage is optional; the Copilot remains usable without it.
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable storage.
    }
  },
};
