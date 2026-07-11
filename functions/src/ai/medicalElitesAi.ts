import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onCall } from "firebase-functions/v2/https";

import { requestOpenAiResponse } from "./openai";
import { buildSystemInstruction } from "../prompts/modes";
import type { AiAssistantRequest, AiAssistantResponse } from "../types";
import { enforceModeAccess, resolveUserAccess } from "../utils/access";
import { parseAiRequest } from "../utils/validation";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const MODEL = "gpt-5-mini";

export const medicalElitesAi = onCall<AiAssistantRequest>(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 120,
    memory: "512MiB",
    maxInstances: 10,
    enforceAppCheck: false,
  },
  async (request): Promise<AiAssistantResponse> => {
    const user = await resolveUserAccess(request);
    const { mode, prompt, context } = parseAiRequest(request.data);
    enforceModeAccess(mode, user.role);

    const result = await requestOpenAiResponse({
      apiKey: OPENAI_API_KEY.value(),
      model: MODEL,
      instructions: buildSystemInstruction(mode),
      input: context ? `${prompt}\n\nSupporting context:\n${context}` : prompt,
    });

    await getFirestore().collection("aiUsageLogs").add({
      userId: user.uid,
      userEmail: user.email,
      role: user.role,
      mode,
      model: MODEL,
      requestId: result.requestId,
      promptLength: prompt.length,
      contextLength: context.length,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      text: result.text,
      model: MODEL,
      requestId: result.requestId,
    };
  }
);
