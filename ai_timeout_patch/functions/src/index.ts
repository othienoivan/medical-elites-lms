import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const db = getFirestore();

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
} as const;

type CallableData = {
  mode?: unknown;
  prompt?: unknown;
  context?: unknown;
};

function asText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function assertAuthorized(uid: string, mode: string): Promise<void> {
  const profile = await db.doc(`users/${uid}`).get();
  const role = profile.exists ? String(profile.get("role") ?? "") : "";

  if (mode === "curriculum_import" && !["admin", "tutor"].includes(role)) {
    throw new HttpsError(
      "permission-denied",
      "Only administrator and tutor accounts can analyse curricula."
    );
  }
}

function curriculumSystemPrompt(): string {
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

export const medicalElitesAi = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 540,
    memory: "1GiB",
    secrets: [OPENAI_API_KEY],
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Please sign in before using Medi AI.");
    }

    const data = (request.data ?? {}) as CallableData;
    const mode = asText(data.mode, 80);
    const prompt = asText(data.prompt, 12_000);
    const context = asText(data.context, mode === "curriculum_import" ? 90_000 : 45_000);

    if (!allowedModes.has(mode)) {
      throw new HttpsError("invalid-argument", `Unsupported AI mode: ${mode || "missing"}.`);
    }
    if (!prompt) {
      throw new HttpsError("invalid-argument", "A prompt is required.");
    }

    await assertAuthorized(request.auth.uid, mode);

    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "The OPENAI_API_KEY Firebase secret is not configured."
      );
    }

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    try {
      if (mode === "curriculum_import") {
        if (context.length < 100) {
          throw new HttpsError("invalid-argument", "The extracted curriculum text is too short for AI analysis.");
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
          createdAt: FieldValue.serverTimestamp(),
        });

        return { text, model: completion.model, requestId: completion.id };
      }

      const completion = await client.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Medi, the Medical Elites academic assistant. Give accurate, educational answers, clearly state uncertainty, and never present output as a substitute for professional clinical judgment.",
          },
          {
            role: "user",
            content: context ? `${prompt}\n\nContext:\n${context}` : prompt,
          },
        ],
        max_completion_tokens: 8_000,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error("OpenAI returned an empty response.");

      await db.collection("aiUsageLogs").add({
        uid: request.auth.uid,
        mode,
        model: completion.model,
        requestId: completion.id,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { text, model: completion.model, requestId: completion.id };
    } catch (error) {
      if (error instanceof HttpsError) throw error;

      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status?: unknown }).status)
          : undefined;
      const message = error instanceof Error ? error.message : "Unknown OpenAI error";

      console.error("Medical Elites AI request failed", {
        mode,
        uid: request.auth.uid,
        status,
        message,
      });

      if (status === 401) {
        throw new HttpsError("failed-precondition", "The configured OpenAI API key is invalid.");
      }
      if (status === 429) {
        throw new HttpsError("resource-exhausted", "OpenAI rate limit or account quota was reached. Please try again shortly.");
      }

      throw new HttpsError("internal", `AI analysis failed: ${message.slice(0, 300)}`);
    }
  }
);
