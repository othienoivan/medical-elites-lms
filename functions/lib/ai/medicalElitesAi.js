"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalElitesAi = void 0;
const firestore_1 = require("firebase-admin/firestore");
const params_1 = require("firebase-functions/params");
const https_1 = require("firebase-functions/v2/https");
const openai_1 = require("./openai");
const modes_1 = require("../prompts/modes");
const access_1 = require("../utils/access");
const validation_1 = require("../utils/validation");
const OPENAI_API_KEY = (0, params_1.defineSecret)("OPENAI_API_KEY");
const MODEL = "gpt-5-mini";
exports.medicalElitesAi = (0, https_1.onCall)({
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 120,
    memory: "512MiB",
    maxInstances: 10,
    enforceAppCheck: false,
}, async (request) => {
    const user = await (0, access_1.resolveUserAccess)(request);
    const { mode, prompt, context } = (0, validation_1.parseAiRequest)(request.data);
    (0, access_1.enforceModeAccess)(mode, user.role);
    const result = await (0, openai_1.requestOpenAiResponse)({
        apiKey: OPENAI_API_KEY.value(),
        model: MODEL,
        instructions: (0, modes_1.buildSystemInstruction)(mode),
        input: context ? `${prompt}\n\nSupporting context:\n${context}` : prompt,
    });
    await (0, firestore_1.getFirestore)().collection("aiUsageLogs").add({
        userId: user.uid,
        userEmail: user.email,
        role: user.role,
        mode,
        model: MODEL,
        requestId: result.requestId,
        promptLength: prompt.length,
        contextLength: context.length,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return {
        text: result.text,
        model: MODEL,
        requestId: result.requestId,
    };
});
//# sourceMappingURL=medicalElitesAi.js.map