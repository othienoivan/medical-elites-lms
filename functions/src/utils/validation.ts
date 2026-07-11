import { HttpsError } from "firebase-functions/v2/https";
import { MODE_INSTRUCTIONS } from "../prompts/modes";
import type { AiAssistantMode, AiAssistantRequest } from "../types";

const MAX_PROMPT_LENGTH = 12_000;
const MAX_CONTEXT_LENGTH = 20_000;

export function parseAiRequest(data: unknown): Required<AiAssistantRequest> {
  const input = (data ?? {}) as Partial<AiAssistantRequest>;
  const mode = String(input.mode ?? "") as AiAssistantMode;
  const prompt = String(input.prompt ?? "").trim();
  const context = String(input.context ?? "").trim();

  if (!Object.prototype.hasOwnProperty.call(MODE_INSTRUCTIONS, mode)) {
    throw new HttpsError("invalid-argument", "Unsupported AI assistant mode.");
  }

  if (!prompt) {
    throw new HttpsError("invalid-argument", "Enter a prompt.");
  }

  if (prompt.length > MAX_PROMPT_LENGTH || context.length > MAX_CONTEXT_LENGTH) {
    throw new HttpsError(
      "invalid-argument",
      "The prompt or supporting context exceeds the supported length."
    );
  }

  return { mode, prompt, context };
}
