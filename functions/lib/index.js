"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicalElitesAi = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
(0, app_1.initializeApp)();
const OPENAI_API_KEY = (0, params_1.defineSecret)("OPENAI_API_KEY");
const db = (0, firestore_1.getFirestore)();
const allowedModes = new Set([
    "student_explain",
    "student_summarize",
    "student_quiz",
    "student_feedback",
    "tutor_questions",
    "tutor_lesson",
    "tutor_marking_guide",
    "tutor_performance",
    "curriculum_import",
]);
const curriculumSchema = {
    type: "object",
    additionalProperties: false,
    required: ["programme", "courseUnits", "warnings"],
    properties: {
        programme: {
            type: "object",
            additionalProperties: false,
            required: [
                "title",
                "code",
                "award",
                "durationYears",
                "department",
                "description",
                "confidence",
            ],
            properties: {
                title: { type: "string" },
                code: { type: ["string", "null"] },
                award: { type: ["string", "null"] },
                durationYears: { type: ["number", "null"] },
                department: { type: ["string", "null"] },
                description: { type: ["string", "null"] },
                confidence: { type: "integer", minimum: 0, maximum: 100 },
            },
        },
        courseUnits: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: [
                    "title",
                    "code",
                    "description",
                    "yearOfStudy",
                    "semester",
                    "creditUnits",
                    "contactHours",
                    "lectureHours",
                    "tutorialHours",
                    "practicalHours",
                    "clinicalHours",
                    "assessmentHours",
                    "prerequisites",
                    "learningOutcomes",
                    "confidence",
                    "modules",
                ],
                properties: {
                    title: { type: "string" },
                    code: { type: ["string", "null"] },
                    description: { type: ["string", "null"] },
                    yearOfStudy: { type: ["number", "null"] },
                    semester: { type: ["number", "null"] },
                    creditUnits: { type: ["number", "null"] },
                    contactHours: { type: ["number", "null"] },
                    lectureHours: { type: ["number", "null"] },
                    tutorialHours: { type: ["number", "null"] },
                    practicalHours: { type: ["number", "null"] },
                    clinicalHours: { type: ["number", "null"] },
                    assessmentHours: { type: ["number", "null"] },
                    prerequisites: { type: "array", items: { type: "string" } },
                    learningOutcomes: { type: "array", items: { type: "string" } },
                    confidence: { type: "integer", minimum: 0, maximum: 100 },
                    modules: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            required: [
                                "title",
                                "code",
                                "description",
                                "estimatedHours",
                                "learningOutcomes",
                                "topics",
                                "confidence",
                            ],
                            properties: {
                                title: { type: "string" },
                                code: { type: ["string", "null"] },
                                description: { type: ["string", "null"] },
                                estimatedHours: { type: ["number", "null"] },
                                learningOutcomes: { type: "array", items: { type: "string" } },
                                topics: { type: "array", items: { type: "string" } },
                                confidence: { type: "integer", minimum: 0, maximum: 100 },
                            },
                        },
                    },
                },
            },
        },
        warnings: { type: "array", items: { type: "string" } },
    },
};
function asText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
async function assertAuthorized(uid, mode) {
    const profile = await db.doc(`users/${uid}`).get();
    const role = profile.exists ? String(profile.get("role") ?? "") : "";
    if (mode === "curriculum_import" && !["admin", "tutor"].includes(role)) {
        throw new https_1.HttpsError("permission-denied", "Only administrator and tutor accounts can analyse curricula.");
    }
}
function curriculumSystemPrompt() {
    return [
        "You are the Medical Elites curriculum extraction engine.",
        "Extract only information supported by the supplied curriculum text.",
        "Do not invent course-unit codes, credit units, contact hours, semesters, modules, or outcomes.",
        "Use null for unavailable numeric or scalar values and empty arrays for unavailable lists.",
        "Preserve official curriculum wording wherever practical.",
        "A module is a major content block or topic group inside a course unit, not an individual sentence.",
        "If total contactHours is not explicitly stated but component hours are explicit, calculate their sum and add a warning explaining the calculation.",
        "Confidence must reflect the clarity of the source, from 0 to 100.",
    ].join(" ");
}
exports.medicalElitesAi = (0, https_1.onCall)({
    region: "us-central1",
    timeoutSeconds: 540,
    memory: "1GiB",
    secrets: [OPENAI_API_KEY],
    enforceAppCheck: false,
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Please sign in before using Medi AI.");
    }
    const data = (request.data ?? {});
    const mode = asText(data.mode, 80);
    const prompt = asText(data.prompt, 12_000);
    const context = asText(data.context, mode === "curriculum_import" ? 90_000 : 45_000);
    if (!allowedModes.has(mode)) {
        throw new https_1.HttpsError("invalid-argument", `Unsupported AI mode: ${mode || "missing"}.`);
    }
    if (!prompt) {
        throw new https_1.HttpsError("invalid-argument", "A prompt is required.");
    }
    await assertAuthorized(request.auth.uid, mode);
    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
        throw new https_1.HttpsError("failed-precondition", "The OPENAI_API_KEY Firebase secret is not configured.");
    }
    const { default: OpenAI } = await Promise.resolve().then(() => __importStar(require("openai")));
    const client = new OpenAI({ apiKey });
    try {
        if (mode === "curriculum_import") {
            if (context.length < 100) {
                throw new https_1.HttpsError("invalid-argument", "The extracted curriculum text is too short for AI analysis.");
            }
            const completion = await client.chat.completions.create({
                model: "gpt-5-mini",
                messages: [
                    { role: "system", content: curriculumSystemPrompt() },
                    { role: "user", content: `${prompt}\n\nCURRICULUM SOURCE:\n${context}` },
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "medical_elites_curriculum",
                        strict: true,
                        schema: curriculumSchema,
                    },
                },
                max_completion_tokens: 24_000,
            });
            const text = completion.choices[0]?.message?.content;
            if (!text) {
                throw new Error("OpenAI returned an empty curriculum response.");
            }
            await db.collection("aiUsageLogs").add({
                uid: request.auth.uid,
                mode,
                model: completion.model,
                requestId: completion.id,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            return { text, model: completion.model, requestId: completion.id };
        }
        const completion = await client.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                {
                    role: "system",
                    content: "You are Medi, the Medical Elites academic assistant. Give accurate, educational answers, clearly state uncertainty, and never present output as a substitute for professional clinical judgment.",
                },
                {
                    role: "user",
                    content: context ? `${prompt}\n\nContext:\n${context}` : prompt,
                },
            ],
            max_completion_tokens: 8_000,
        });
        const text = completion.choices[0]?.message?.content;
        if (!text)
            throw new Error("OpenAI returned an empty response.");
        await db.collection("aiUsageLogs").add({
            uid: request.auth.uid,
            mode,
            model: completion.model,
            requestId: completion.id,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { text, model: completion.model, requestId: completion.id };
    }
    catch (error) {
        if (error instanceof https_1.HttpsError)
            throw error;
        const status = typeof error === "object" && error !== null && "status" in error
            ? Number(error.status)
            : undefined;
        const message = error instanceof Error ? error.message : "Unknown OpenAI error";
        console.error("Medical Elites AI request failed", {
            mode,
            uid: request.auth.uid,
            status,
            message,
        });
        if (status === 401) {
            throw new https_1.HttpsError("failed-precondition", "The configured OpenAI API key is invalid.");
        }
        if (status === 429) {
            throw new https_1.HttpsError("resource-exhausted", "OpenAI rate limit or account quota was reached. Please try again shortly.");
        }
        throw new https_1.HttpsError("internal", `AI analysis failed: ${message.slice(0, 300)}`);
    }
});
//# sourceMappingURL=index.js.map