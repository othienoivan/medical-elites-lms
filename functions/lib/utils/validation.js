"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAiRequest = parseAiRequest;
const https_1 = require("firebase-functions/v2/https");
const modes_1 = require("../prompts/modes");
const MAX_PROMPT_LENGTH = 12_000;
const MAX_CONTEXT_LENGTH = 20_000;
function parseAiRequest(data) {
    const input = (data ?? {});
    const mode = String(input.mode ?? "");
    const prompt = String(input.prompt ?? "").trim();
    const context = String(input.context ?? "").trim();
    if (!Object.prototype.hasOwnProperty.call(modes_1.MODE_INSTRUCTIONS, mode)) {
        throw new https_1.HttpsError("invalid-argument", "Unsupported AI assistant mode.");
    }
    if (!prompt) {
        throw new https_1.HttpsError("invalid-argument", "Enter a prompt.");
    }
    if (prompt.length > MAX_PROMPT_LENGTH || context.length > MAX_CONTEXT_LENGTH) {
        throw new https_1.HttpsError("invalid-argument", "The prompt or supporting context exceeds the supported length.");
    }
    return { mode, prompt, context };
}
//# sourceMappingURL=validation.js.map