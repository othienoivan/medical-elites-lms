"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flutterwaveWebhook = exports.createDonationCheckout = exports.medicalElitesAi = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const node_crypto_1 = require("node:crypto");
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
    const { default: OpenAI } = await import("openai");
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
const FLUTTERWAVE_SECRET_KEY = (0, params_1.defineSecret)("FLUTTERWAVE_SECRET_KEY");
const FLUTTERWAVE_WEBHOOK_SECRET = (0, params_1.defineSecret)("FLUTTERWAVE_WEBHOOK_SECRET");
const FLUTTERWAVE_MONTHLY_PLAN_ID = (0, params_1.defineSecret)("FLUTTERWAVE_MONTHLY_PLAN_ID");
function donationText(value, maximum) {
    return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
exports.createDonationCheckout = (0, https_1.onCall)({
    region: "us-central1",
    timeoutSeconds: 60,
    secrets: [FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_MONTHLY_PLAN_ID],
}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in before donating.");
    const data = (request.data ?? {});
    const amount = Number(data.amount);
    const currency = donationText(data.currency, 3);
    const frequency = donationText(data.frequency, 20);
    const method = donationText(data.method, 30);
    const fullName = donationText(data.fullName, 120);
    const email = donationText(data.email, 180);
    const phoneNumber = donationText(data.phoneNumber, 30);
    const purpose = donationText(data.purpose, 240);
    const anonymous = data.anonymous === true;
    const requestedReturnUrl = donationText(data.returnUrl, 500);
    if (!Number.isFinite(amount) || amount < 1000 || amount > 100_000_000) {
        throw new https_1.HttpsError("invalid-argument", "Donation amount must be between UGX 1,000 and UGX 100,000,000.");
    }
    if (currency !== "UGX")
        throw new https_1.HttpsError("invalid-argument", "Only UGX donations are currently supported.");
    if (!["one_time", "monthly"].includes(frequency))
        throw new https_1.HttpsError("invalid-argument", "Invalid donation frequency.");
    if (!["mobile_money", "card"].includes(method))
        throw new https_1.HttpsError("invalid-argument", "Invalid payment method.");
    if (frequency === "monthly" && method !== "card") {
        throw new https_1.HttpsError("failed-precondition", "Automatic monthly donations currently require a card.");
    }
    if (!fullName || !email)
        throw new https_1.HttpsError("invalid-argument", "Donor name and email are required.");
    if (method === "mobile_money" && !phoneNumber)
        throw new https_1.HttpsError("invalid-argument", "A Mobile Money number is required.");
    const secretKey = FLUTTERWAVE_SECRET_KEY.value();
    if (!secretKey)
        throw new https_1.HttpsError("failed-precondition", "Flutterwave is not configured.");
    const txRef = `ME-DON-${Date.now()}-${request.auth.uid.slice(0, 8)}`;
    const donationRef = db.collection("donations").doc(txRef);
    await donationRef.set({
        transactionReference: txRef,
        donorUid: request.auth.uid,
        donorName: anonymous ? "Anonymous" : fullName,
        donorEmail: email,
        donorPhone: phoneNumber || null,
        amount,
        currency,
        frequency,
        method,
        purpose: purpose || null,
        anonymous,
        status: "pending",
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    const appUrl = process.env.APP_URL || "https://medical-elites-lms.web.app";
    const allowedReturnOrigins = new Set([
        "https://medical-elites-lms.web.app",
        "https://medical-elites-lms.firebaseapp.com",
        appUrl,
    ]);
    let returnUrl = `${appUrl}/dashboard?payment=complete`;
    if (requestedReturnUrl) {
        try {
            const parsed = new URL(requestedReturnUrl);
            if (allowedReturnOrigins.has(parsed.origin))
                returnUrl = parsed.toString();
        }
        catch {
            // Ignore malformed or untrusted return URLs.
        }
    }
    const payload = {
        tx_ref: txRef,
        amount,
        currency,
        redirect_url: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}tx_ref=${encodeURIComponent(txRef)}`,
        payment_options: method === "mobile_money" ? "mobilemoneyuganda" : "card",
        customer: { email, name: fullName, phonenumber: phoneNumber || undefined },
        customizations: {
            title: "Medical Elites Donation",
            description: purpose || "Support Medical Elites learning access",
            logo: `${appUrl}/images/logo.png`,
        },
        meta: { donorUid: request.auth.uid, frequency, anonymous, purpose },
    };
    if (frequency === "monthly") {
        const planId = FLUTTERWAVE_MONTHLY_PLAN_ID.value();
        if (!planId)
            throw new https_1.HttpsError("failed-precondition", "The monthly donation plan is not configured.");
        payload.payment_plan = planId;
    }
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || result.status !== "success" || !result.data?.link) {
        await donationRef.update({ status: "checkout_failed", gatewayMessage: result.message || "Unknown error", updatedAt: firestore_1.FieldValue.serverTimestamp() });
        throw new https_1.HttpsError("internal", result.message || "Unable to create Flutterwave checkout.");
    }
    await donationRef.update({ checkoutUrlCreated: true, updatedAt: firestore_1.FieldValue.serverTimestamp() });
    return { checkoutUrl: result.data.link, transactionReference: txRef };
});
exports.flutterwaveWebhook = (0, https_1.onRequest)({
    region: "us-central1",
    timeoutSeconds: 60,
    secrets: [FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_WEBHOOK_SECRET],
}, async (request, response) => {
    const secretHash = FLUTTERWAVE_WEBHOOK_SECRET.value();
    const flutterwaveSignature = String(request.header("flutterwave-signature") || "");
    const legacyVerificationHash = String(request.header("verif-hash") || "");
    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
    const calculatedSignature = secretHash
        ? (0, node_crypto_1.createHmac)("sha256", secretHash).update(rawBody).digest("base64")
        : "";
    const hmacMatches = Boolean(flutterwaveSignature
        && calculatedSignature
        && Buffer.byteLength(flutterwaveSignature) === Buffer.byteLength(calculatedSignature)
        && (0, node_crypto_1.timingSafeEqual)(Buffer.from(flutterwaveSignature), Buffer.from(calculatedSignature)));
    const legacyMatches = Boolean(secretHash && legacyVerificationHash === secretHash);
    if (!secretHash || (!hmacMatches && !legacyMatches)) {
        response.status(401).send("Invalid webhook signature");
        return;
    }
    const body = request.body;
    const eventData = body.data ?? {};
    const txRef = String(eventData.tx_ref ?? eventData.reference ?? "");
    const transactionId = String(eventData.id ?? "");
    if (!txRef) {
        response.status(200).send("Ignored");
        return;
    }
    const ref = db.collection("donations").doc(txRef);
    const existing = await ref.get();
    if (!existing.exists) {
        response.status(200).send("Unknown reference");
        return;
    }
    if (existing.get("status") === "successful") {
        response.status(200).send("Already processed");
        return;
    }
    const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
        headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY.value()}` },
    });
    const verified = await verifyResponse.json();
    const verifiedData = verified.data ?? {};
    const expectedAmount = Number(existing.get("amount"));
    const valid = verifyResponse.ok
        && verified.status === "success"
        && String(verifiedData.status) === "successful"
        && String(verifiedData.tx_ref) === txRef
        && String(verifiedData.currency) === "UGX"
        && Number(verifiedData.amount) >= expectedAmount;
    await ref.update({
        status: valid ? "successful" : "verification_failed",
        flutterwaveTransactionId: transactionId || null,
        gatewayStatus: verifiedData.status ?? null,
        verifiedAmount: verifiedData.amount ?? null,
        verifiedCurrency: verifiedData.currency ?? null,
        webhookEvent: body.event ?? body.type ?? null,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        verifiedAt: valid ? firestore_1.FieldValue.serverTimestamp() : null,
    });
    response.status(200).send(valid ? "OK" : "Verification failed");
});
//# sourceMappingURL=index.js.map