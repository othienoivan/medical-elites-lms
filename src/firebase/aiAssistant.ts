import { getFunctions, httpsCallable } from "firebase/functions";

import app from "../config/firebase";
import type {
  AiAssistantRequest,
  AiAssistantResponse,
} from "../models/AiAssistant";

const functions = getFunctions(app);
const callMedicalElitesAi = httpsCallable<
  AiAssistantRequest,
  AiAssistantResponse
>(functions, "medicalElitesAi", {
  timeout: 300_000,
});

export async function generateAiResponse(
  request: AiAssistantRequest
): Promise<AiAssistantResponse> {
  const result = await callMedicalElitesAi({
    ...request,
    prompt: request.prompt.trim(),
    context: request.context?.trim() || "",
  });

  return result.data;
}
