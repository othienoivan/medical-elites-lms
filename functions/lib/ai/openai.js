"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOpenAiResponse = requestOpenAiResponse;
const https_1 = require("firebase-functions/v2/https");
function extractResponseText(payload) {
    if (payload.output_text?.trim())
        return payload.output_text.trim();
    return (payload.output
        ?.flatMap((item) => item.content ?? [])
        .filter((item) => item.type === "output_text" && item.text)
        .map((item) => item.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n") ?? "");
}
async function requestOpenAiResponse(options) {
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
    const payload = (await response.json());
    if (!response.ok) {
        console.error("OpenAI API request failed", {
            status: response.status,
            requestId: payload.id,
            message: payload.error?.message,
        });
        throw new https_1.HttpsError("internal", "The AI provider could not complete the request. Please try again.");
    }
    const text = extractResponseText(payload);
    if (!text) {
        throw new https_1.HttpsError("internal", "The AI provider returned no text.");
    }
    return {
        text,
        requestId: payload.id ?? `ai-${Date.now()}`,
    };
}
//# sourceMappingURL=openai.js.map