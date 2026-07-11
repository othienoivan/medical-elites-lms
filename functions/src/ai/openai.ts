import { HttpsError } from "firebase-functions/v2/https";

interface OpenAiContentItem {
  type?: string;
  text?: string;
}

interface OpenAiOutputItem {
  content?: OpenAiContentItem[];
}

interface OpenAiResponsePayload {
  id?: string;
  output_text?: string;
  output?: OpenAiOutputItem[];
  error?: { message?: string };
}

function extractResponseText(payload: OpenAiResponsePayload): string {
  if (payload.output_text?.trim()) return payload.output_text.trim();

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && item.text)
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

export async function requestOpenAiResponse(options: {
  apiKey: string;
  model: string;
  instructions: string;
  input: string;
}): Promise<{ text: string; requestId: string }> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      instructions: options.instructions,
      input: options.input,
      max_output_tokens: 2500,
    }),
  });

  const payload = (await response.json()) as OpenAiResponsePayload;

  if (!response.ok) {
    console.error("OpenAI API request failed", {
      status: response.status,
      requestId: payload.id,
      message: payload.error?.message,
    });
    throw new HttpsError(
      "internal",
      "The AI provider could not complete the request. Please try again."
    );
  }

  const text = extractResponseText(payload);
  if (!text) {
    throw new HttpsError("internal", "The AI provider returned no text.");
  }

  return {
    text,
    requestId: payload.id ?? `ai-${Date.now()}`,
  };
}
