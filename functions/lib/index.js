"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantSubscriptionStatus = exports.assignTenantSubscription = exports.saveSubscriptionPlan = exports.assignTenantOwner = exports.updateTenantStatus = exports.updateTenantProfile = exports.createTenant = exports.bootstrapTenantWorkspace = exports.completeModuleLearning = exports.submitQuizAttempt = exports.reviewMarketplaceSellerVerification = exports.upsertMarketplaceCoupon = exports.upsertMarketplacePromotion = exports.moderateMarketplaceReview = exports.voteMarketplaceReview = exports.submitMarketplaceReview = exports.requestCommerceRefund = exports.reconcileCommercePayment = exports.flutterwaveCommerceWebhook = exports.createMarketplaceCartCheckout = exports.createCommerceCheckout = exports.upsertFinanceCommissionRule = exports.completeFinanceWithdrawal = exports.reviewFinanceWithdrawal = exports.requestFinanceWithdrawal = exports.distributeFinanceRevenue = exports.createFinanceWallet = exports.flutterwaveWebhook = exports.createDonationCheckout = exports.medicalElitesAi = void 0;
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
const MODE_ROLES = {
    student_explain: ["student", "tutor", "admin"],
    student_summarize: ["student", "tutor", "admin"],
    student_quiz: ["student", "tutor", "admin"],
    student_feedback: ["student", "tutor", "admin"],
    tutor_questions: ["tutor", "admin"],
    tutor_lesson: ["tutor", "admin"],
    tutor_marking_guide: ["tutor", "admin"],
    tutor_performance: ["tutor", "admin"],
    curriculum_import: ["tutor", "admin"],
};
async function consumeRateLimit(uid, options) {
    const now = Date.now();
    const bucket = Math.floor(now / (options.windowSeconds * 1000));
    const id = `${options.scope}_${uid}_${bucket}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    const ref = db.collection("functionRateLimits").doc(id);
    await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        const count = snapshot.exists ? Number(snapshot.get("count") ?? 0) : 0;
        if (count >= options.limit) {
            throw new https_1.HttpsError("resource-exhausted", "Too many requests. Please wait and try again.");
        }
        transaction.set(ref, {
            uid,
            scope: options.scope,
            bucket,
            count: count + 1,
            expiresAt: new Date((bucket + 2) * options.windowSeconds * 1000),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    });
}
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
    if (!profile.exists || profile.get("isActive") === false) {
        throw new https_1.HttpsError("permission-denied", "Your account is not active.");
    }
    const role = String(profile.get("role") ?? "");
    const allowedRoles = MODE_ROLES[mode] ?? [];
    if (!allowedRoles.includes(role)) {
        throw new https_1.HttpsError("permission-denied", "Your account is not allowed to use this AI mode.");
    }
    return role;
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
    const role = await assertAuthorized(request.auth.uid, mode);
    await consumeRateLimit(request.auth.uid, {
        scope: `ai_${mode}`,
        limit: mode === "curriculum_import" ? 5 : 20,
        windowSeconds: 60,
    });
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
                role,
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
            role,
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
        throw new https_1.HttpsError("internal", "AI analysis failed. Please try again shortly.");
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
    const clientRequestId = donationText(data.clientRequestId, 120);
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new https_1.HttpsError("invalid-argument", "Enter a valid email address.");
    }
    if (method === "mobile_money" && !phoneNumber)
        throw new https_1.HttpsError("invalid-argument", "A Mobile Money number is required.");
    await consumeRateLimit(request.auth.uid, { scope: "donation_checkout", limit: 5, windowSeconds: 3600 });
    const secretKey = FLUTTERWAVE_SECRET_KEY.value();
    if (!secretKey)
        throw new https_1.HttpsError("failed-precondition", "Flutterwave is not configured.");
    const requestSuffix = clientRequestId || (0, node_crypto_1.randomUUID)();
    const safeSuffix = requestSuffix.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || (0, node_crypto_1.randomUUID)();
    const txRef = `ME-DON-${request.auth.uid.slice(0, 8)}-${safeSuffix}`;
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
    const legacyMatches = Boolean(secretHash
        && legacyVerificationHash
        && Buffer.byteLength(legacyVerificationHash) === Buffer.byteLength(secretHash)
        && (0, node_crypto_1.timingSafeEqual)(Buffer.from(legacyVerificationHash), Buffer.from(secretHash)));
    if (!secretHash || (!hmacMatches && !legacyMatches)) {
        response.status(401).send("Invalid webhook signature");
        return;
    }
    const body = request.body;
    const eventData = body.data ?? {};
    const txRef = String(eventData.tx_ref ?? eventData.reference ?? "");
    const transactionId = String(eventData.id ?? "");
    if (!txRef || !transactionId) {
        response.status(200).send("Ignored");
        return;
    }
    const webhookReceipt = db.collection("webhookReceipts").doc(`flutterwave_${transactionId}`);
    const receiptSnapshot = await webhookReceipt.get();
    if (receiptSnapshot.exists && receiptSnapshot.get("processed") === true) {
        response.status(200).send("Already processed");
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
    await webhookReceipt.set({
        provider: "flutterwave",
        transactionId,
        txRef,
        processed: valid,
        receivedAt: firestore_1.FieldValue.serverTimestamp(),
        event: body.event ?? body.type ?? null,
    }, { merge: true });
    response.status(200).send(valid ? "OK" : "Verification failed");
});
const FINANCE_CURRENCIES = new Set(["UGX", "USD", "KES", "TZS", "RWF"]);
function financeText(value, maximum = 160) {
    return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
function financeAmount(value) {
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount <= 0)
        throw new https_1.HttpsError("invalid-argument", "Amount must be a positive whole number.");
    return amount;
}
function financeCurrency(value) {
    const currency = financeText(value, 3).toUpperCase();
    if (!FINANCE_CURRENCIES.has(currency))
        throw new https_1.HttpsError("invalid-argument", "Unsupported currency.");
    return currency;
}
function financePeriod(now = new Date()) {
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
function safeFinanceId(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);
}
async function financeProfile(uid) {
    const profile = await db.doc(`users/${uid}`).get();
    if (!profile.exists || profile.get("isActive") === false)
        throw new https_1.HttpsError("permission-denied", "Your account is not active.");
    return profile;
}
async function assertFinancePlatformAdmin(uid) {
    const profile = await financeProfile(uid);
    if (profile.get("role") !== "admin" || !["super_admin", "platform_finance"].includes(String(profile.get("platformRole") ?? ""))) {
        throw new https_1.HttpsError("permission-denied", "Platform finance permission is required.");
    }
}
async function claimFinanceCommand(uid, operation, idempotencyKey) {
    const key = financeText(idempotencyKey, 140);
    if (key.length < 8)
        throw new https_1.HttpsError("invalid-argument", "A valid idempotency key is required.");
    const ref = db.collection("financeCommands").doc(safeFinanceId(`${operation}_${key}`));
    await db.runTransaction(async (transaction) => {
        const current = await transaction.get(ref);
        if (current.exists)
            throw new https_1.HttpsError("already-exists", "This financial command has already been processed.");
        transaction.create(ref, { operation, requestedBy: uid, status: "processing", createdAt: firestore_1.FieldValue.serverTimestamp() });
    });
    return ref;
}
exports.createFinanceWallet = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    const profile = await financeProfile(request.auth.uid);
    const data = (request.data ?? {});
    const ownerType = financeText(data.ownerType, 20);
    const ownerId = financeText(data.ownerId, 128);
    const currency = financeCurrency(data.currency);
    if (!new Set(["platform", "institution", "tutor"]).has(ownerType) || !ownerId)
        throw new https_1.HttpsError("invalid-argument", "Valid wallet ownership is required.");
    const isPlatformFinance = profile.get("role") === "admin"
        && ["super_admin", "platform_finance"].includes(String(profile.get("platformRole") ?? ""));
    const isTutorSelfService = profile.get("role") === "tutor"
        && ownerType === "tutor"
        && ownerId === request.auth.uid;
    if (!isPlatformFinance && !isTutorSelfService) {
        throw new https_1.HttpsError("permission-denied", "You may only create your own tutor wallet.");
    }
    const command = await claimFinanceCommand(request.auth.uid, "create_wallet", data.idempotencyKey);
    const walletId = safeFinanceId(`${ownerType}_${ownerId}_${currency}`);
    const walletRef = db.collection("wallets").doc(walletId);
    let created = false;
    try {
        await db.runTransaction(async (transaction) => {
            const existing = await transaction.get(walletRef);
            if (!existing.exists) {
                created = true;
                transaction.create(walletRef, { ownerType, ownerId, currency, status: "active", availableBalance: 0, pendingBalance: 0, frozenBalance: 0, lifetimeCredits: 0, lifetimeDebits: 0, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() });
            }
            transaction.update(command, { status: "completed", walletId, completedAt: firestore_1.FieldValue.serverTimestamp() });
        });
        return { walletId, created };
    }
    catch (error) {
        await command.set({ status: "failed", updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        throw error;
    }
});
async function loadCommissionRule(context) {
    const candidates = [["course", context.courseId], ["tutor", context.tutorId], ["institution", context.institutionId], ["global", "global"]];
    for (const [scope, scopeId] of candidates) {
        if (!scopeId)
            continue;
        const snapshot = await db.collection("commissionRules").where("scope", "==", scope).where("scopeId", "==", scopeId).where("active", "==", true).limit(1).get();
        if (!snapshot.empty)
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return { id: "default_50_50", scope: "global", scopeId: "global", platformPercent: 50, tutorPercent: 50, institutionPercent: 0, active: true };
}
exports.distributeFinanceRevenue = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const amount = financeAmount(data.amount);
    const currency = financeCurrency(data.currency);
    const tutorId = financeText(data.tutorId, 128);
    const institutionId = financeText(data.institutionId, 128);
    const courseId = financeText(data.courseId, 128);
    const reference = financeText(data.reference, 160);
    if (!tutorId || !reference)
        throw new https_1.HttpsError("invalid-argument", "Tutor and reference are required.");
    const command = await claimFinanceCommand(request.auth.uid, "distribute_revenue", data.idempotencyKey);
    const rule = await loadCommissionRule({ tutorId, institutionId: institutionId || undefined, courseId: courseId || undefined });
    const platformPercent = Number(rule.platformPercent ?? 0);
    const tutorPercent = Number(rule.tutorPercent ?? 0);
    const institutionPercent = Number(rule.institutionPercent ?? 0);
    if (Math.abs(platformPercent + tutorPercent + institutionPercent - 100) > 0.001)
        throw new https_1.HttpsError("failed-precondition", "Commission rule must total 100%.");
    const platformAmount = Math.round(amount * platformPercent / 100);
    const tutorAmount = Math.round(amount * tutorPercent / 100);
    const institutionAmount = amount - platformAmount - tutorAmount;
    const platformWalletId = `platform_medical-elites_${currency}`;
    const tutorWalletId = safeFinanceId(`tutor_${tutorId}_${currency}`);
    const institutionWalletId = institutionId ? safeFinanceId(`institution_${institutionId}_${currency}`) : "";
    const journalRef = db.collection("journals").doc();
    const period = financePeriod();
    const allocations = { platform: platformAmount, tutor: tutorAmount, institution: institutionAmount };
    try {
        await db.runTransaction(async (transaction) => {
            const walletRefs = [db.collection("wallets").doc(platformWalletId), db.collection("wallets").doc(tutorWalletId), ...(institutionWalletId ? [db.collection("wallets").doc(institutionWalletId)] : [])];
            const walletSnaps = await Promise.all(walletRefs.map(ref => transaction.get(ref)));
            const ownerData = [{ ownerType: "platform", ownerId: "medical-elites", amount: platformAmount }, { ownerType: "tutor", ownerId: tutorId, amount: tutorAmount }, ...(institutionWalletId ? [{ ownerType: "institution", ownerId: institutionId, amount: institutionAmount }] : [])];
            walletRefs.forEach((ref, index) => {
                const meta = ownerData[index];
                const current = walletSnaps[index];
                if (!current.exists)
                    transaction.create(ref, { ownerType: meta.ownerType, ownerId: meta.ownerId, currency, status: "active", availableBalance: meta.amount, pendingBalance: 0, frozenBalance: 0, lifetimeCredits: meta.amount, lifetimeDebits: 0, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() });
                else
                    transaction.update(ref, { availableBalance: firestore_1.FieldValue.increment(meta.amount), lifetimeCredits: firestore_1.FieldValue.increment(meta.amount), updatedAt: firestore_1.FieldValue.serverTimestamp() });
            });
            const lines = [{ accountId: "platform_clearing", direction: "debit", amount, memo: reference }, { accountId: "platform_revenue", walletId: platformWalletId, ownerId: "medical-elites", direction: "credit", amount: platformAmount }, { accountId: `tutor_revenue_${tutorId}`, walletId: tutorWalletId, ownerId: tutorId, direction: "credit", amount: tutorAmount }, ...(institutionWalletId && institutionAmount > 0 ? [{ accountId: `institution_revenue_${institutionId}`, walletId: institutionWalletId, ownerId: institutionId, direction: "credit", amount: institutionAmount }] : [])];
            transaction.create(journalRef, { reference, idempotencyKey: financeText(data.idempotencyKey, 140), eventType: "revenue.distributed", currency, accountingPeriod: period, commissionRuleId: rule.id, lines, status: "posted", createdBy: request.auth.uid, createdAt: firestore_1.FieldValue.serverTimestamp() });
            lines.forEach((line, index) => transaction.create(db.collection("ledgerEntries").doc(), { ...line, journalId: journalRef.id, reference, currency, accountingPeriod: period, createdAt: firestore_1.FieldValue.serverTimestamp() }));
            transaction.update(command, { status: "completed", journalId: journalRef.id, completedAt: firestore_1.FieldValue.serverTimestamp() });
        });
        return { journalId: journalRef.id, allocations };
    }
    catch (error) {
        await command.set({ status: "failed", updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        throw error;
    }
});
exports.requestFinanceWithdrawal = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    const profile = await financeProfile(request.auth.uid);
    const data = (request.data ?? {});
    const walletId = financeText(data.walletId, 180);
    const amount = financeAmount(data.amount);
    const currency = financeCurrency(data.currency);
    const payoutMethod = financeText(data.payoutMethod, 40);
    const payoutDestination = financeText(data.payoutDestination, 120);
    if (!walletId || !payoutMethod || !payoutDestination)
        throw new https_1.HttpsError("invalid-argument", "Wallet and payout details are required.");
    const walletRef = db.collection("wallets").doc(walletId);
    const wallet = await walletRef.get();
    const isPlatformFinance = profile.get("role") === "admin" && ["super_admin", "platform_finance"].includes(String(profile.get("platformRole") ?? ""));
    if (!wallet.exists || (!isPlatformFinance && wallet.get("ownerId") !== request.auth.uid))
        throw new https_1.HttpsError("permission-denied", "You cannot withdraw from this wallet.");
    if (wallet.get("currency") !== currency || wallet.get("status") !== "active")
        throw new https_1.HttpsError("failed-precondition", "Wallet is unavailable for this withdrawal.");
    const command = await claimFinanceCommand(request.auth.uid, "request_withdrawal", data.idempotencyKey);
    const withdrawalRef = db.collection("withdrawals").doc();
    await db.runTransaction(async (transaction) => {
        const fresh = await transaction.get(walletRef);
        const available = Number(fresh.get("availableBalance") ?? 0);
        const frozen = Number(fresh.get("frozenBalance") ?? 0);
        if (available < amount)
            throw new https_1.HttpsError("failed-precondition", "Insufficient available balance.");
        transaction.update(walletRef, { availableBalance: available - amount, frozenBalance: frozen + amount, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        transaction.create(withdrawalRef, { walletId, ownerId: String(fresh.get("ownerId")), amount: { amount, currency }, status: "requested", payoutMethod, payoutDestinationMasked: payoutDestination.length > 4 ? `***${payoutDestination.slice(-4)}` : "****", requestedBy: request.auth.uid, requestedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() });
        transaction.update(command, { status: "completed", withdrawalId: withdrawalRef.id, completedAt: firestore_1.FieldValue.serverTimestamp() });
    });
    return { withdrawalId: withdrawalRef.id };
});
exports.reviewFinanceWithdrawal = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const withdrawalId = financeText(data.withdrawalId, 160);
    const decision = financeText(data.decision, 16);
    const reason = financeText(data.reason, 400);
    if (!withdrawalId || !["approve", "reject"].includes(decision))
        throw new https_1.HttpsError("invalid-argument", "A valid review decision is required.");
    const command = await claimFinanceCommand(request.auth.uid, "review_withdrawal", data.idempotencyKey);
    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    let status = decision === "approve" ? "approved" : "rejected";
    await db.runTransaction(async (transaction) => {
        const withdrawal = await transaction.get(withdrawalRef);
        if (!withdrawal.exists || withdrawal.get("status") !== "requested")
            throw new https_1.HttpsError("failed-precondition", "Withdrawal is not awaiting review.");
        if (decision === "reject") {
            const walletRef = db.collection("wallets").doc(String(withdrawal.get("walletId")));
            const wallet = await transaction.get(walletRef);
            const amount = Number(withdrawal.get("amount.amount") ?? 0);
            transaction.update(walletRef, { availableBalance: Number(wallet.get("availableBalance") ?? 0) + amount, frozenBalance: Math.max(0, Number(wallet.get("frozenBalance") ?? 0) - amount), updatedAt: firestore_1.FieldValue.serverTimestamp() });
        }
        transaction.update(withdrawalRef, { status, reviewedAt: firestore_1.FieldValue.serverTimestamp(), reviewedBy: request.auth.uid, rejectionReason: decision === "reject" ? reason || "Rejected by finance operations" : null, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        transaction.update(command, { status: "completed", withdrawalId, completedAt: firestore_1.FieldValue.serverTimestamp() });
    });
    return { status };
});
exports.completeFinanceWithdrawal = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const withdrawalId = financeText(data.withdrawalId, 160);
    const externalReference = financeText(data.externalReference, 180);
    if (!withdrawalId || !externalReference) {
        throw new https_1.HttpsError("invalid-argument", "Withdrawal and external payment reference are required.");
    }
    const command = await claimFinanceCommand(request.auth.uid, "complete_withdrawal", data.idempotencyKey);
    const withdrawalRef = db.collection("withdrawals").doc(withdrawalId);
    try {
        await db.runTransaction(async (transaction) => {
            const withdrawal = await transaction.get(withdrawalRef);
            if (!withdrawal.exists || !["approved", "processing"].includes(String(withdrawal.get("status") ?? ""))) {
                throw new https_1.HttpsError("failed-precondition", "Withdrawal must be approved before it can be marked paid.");
            }
            const walletRef = db.collection("wallets").doc(String(withdrawal.get("walletId") ?? ""));
            const wallet = await transaction.get(walletRef);
            if (!wallet.exists)
                throw new https_1.HttpsError("not-found", "Wallet was not found.");
            const amount = Number(withdrawal.get("amount.amount") ?? 0);
            const currency = String(withdrawal.get("amount.currency") ?? wallet.get("currency") ?? "UGX");
            const frozen = Number(wallet.get("frozenBalance") ?? 0);
            const lifetimeDebits = Number(wallet.get("lifetimeDebits") ?? 0);
            if (!Number.isSafeInteger(amount) || amount <= 0 || frozen < amount) {
                throw new https_1.HttpsError("failed-precondition", "Reserved wallet funds are insufficient for this payout.");
            }
            const journalRef = db.collection("journals").doc();
            const period = financePeriod();
            const ownerId = String(withdrawal.get("ownerId") ?? wallet.get("ownerId") ?? "");
            const lines = [
                { accountId: `wallet_liability_${walletRef.id}`, walletId: walletRef.id, ownerId, direction: "debit", amount, memo: `Payout ${externalReference}` },
                { accountId: "platform_cash_clearing", direction: "credit", amount, memo: `Payout ${externalReference}` },
            ];
            transaction.update(walletRef, {
                frozenBalance: frozen - amount,
                lifetimeDebits: lifetimeDebits + amount,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            transaction.update(withdrawalRef, {
                status: "paid",
                externalReference,
                paidAt: firestore_1.FieldValue.serverTimestamp(),
                paidBy: request.auth.uid,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            transaction.create(journalRef, {
                reference: `payout:${withdrawalId}`,
                idempotencyKey: financeText(data.idempotencyKey, 140),
                eventType: "withdrawal.paid",
                currency,
                accountingPeriod: period,
                lines,
                status: "posted",
                createdBy: request.auth.uid,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            lines.forEach((line) => transaction.create(db.collection("ledgerEntries").doc(), {
                ...line,
                journalId: journalRef.id,
                reference: `payout:${withdrawalId}`,
                currency,
                accountingPeriod: period,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            }));
            transaction.create(db.collection("platformAuditLogs").doc(), {
                action: "finance.withdrawal.paid",
                actorUserId: request.auth.uid,
                targetType: "withdrawal",
                targetId: withdrawalId,
                metadata: { walletId: walletRef.id, amount, currency, externalReference },
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            transaction.update(command, {
                status: "completed",
                withdrawalId,
                journalId: journalRef.id,
                completedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        });
        return { status: "paid" };
    }
    catch (error) {
        await command.set({ status: "failed", updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        throw error;
    }
});
exports.upsertFinanceCommissionRule = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const rule = data.rule ?? {};
    const scope = financeText(rule.scope, 20) || "global";
    const scopeId = financeText(rule.scopeId, 128) || (scope === "global" ? "global" : "");
    const platformPercent = Number(rule.platformPercent);
    const tutorPercent = Number(rule.tutorPercent);
    const institutionPercent = Number(rule.institutionPercent);
    if (!new Set(["global", "institution", "tutor", "course"]).has(scope) || !scopeId || [platformPercent, tutorPercent, institutionPercent].some(v => !Number.isFinite(v) || v < 0) || Math.abs(platformPercent + tutorPercent + institutionPercent - 100) > 0.001)
        throw new https_1.HttpsError("invalid-argument", "Commission scope and percentages are invalid.");
    const command = await claimFinanceCommand(request.auth.uid, "upsert_commission", data.idempotencyKey);
    const ruleId = financeText(rule.id, 160) || safeFinanceId(`${scope}_${scopeId}`);
    const ref = db.collection("commissionRules").doc(ruleId);
    await ref.set({ name: financeText(rule.name, 120) || `${scope} commission`, scope, scopeId, priority: Number(rule.priority ?? 0), platformPercent, tutorPercent, institutionPercent, active: rule.active !== false, updatedBy: request.auth.uid, updatedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await command.set({ status: "completed", ruleId, completedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    return { ruleId };
});
async function verifyFlutterwaveTransaction(transactionId) {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
        headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY.value()}`, "Content-Type": "application/json" },
    });
    const payload = await response.json();
    if (!response.ok || payload.status !== "success" || !payload.data) {
        throw new Error("Flutterwave transaction verification failed.");
    }
    return payload.data;
}
function safeCommerceReturnUrl(requested) {
    const appUrl = process.env.APP_URL || "https://medical-elites-lms.web.app";
    const allowed = new Set([appUrl, "https://medical-elites-lms.web.app", "https://medical-elites-lms.firebaseapp.com"]);
    if (requested) {
        try {
            const parsed = new URL(requested);
            if (allowed.has(parsed.origin))
                return parsed.toString();
        }
        catch { /* use fallback */ }
    }
    return `${appUrl}/dashboard?payment=complete`;
}
async function resolveCommerceItem(purpose, id) {
    if (purpose === "subscription") {
        const snap = await db.collection("financePlans").doc(id).get();
        if (!snap.exists || snap.get("active") === false)
            throw new https_1.HttpsError("not-found", "The selected subscription plan is unavailable.");
        const price = snap.get("price");
        return { title: String(snap.get("name") ?? "Medical Elites subscription"), amount: financeAmount(price?.amount), currency: financeCurrency(price?.currency), planId: snap.id };
    }
    const snap = await db.collection("commerceProducts").doc(id).get();
    if (!snap.exists || snap.get("status") !== "published")
        throw new https_1.HttpsError("not-found", "The selected product is unavailable.");
    const price = snap.get("price");
    return {
        title: String(snap.get("title") ?? "Medical Elites product"), amount: financeAmount(price?.amount), currency: financeCurrency(price?.currency),
        tenantId: financeText(snap.get("tenantId"), 128) || undefined, tutorId: financeText(snap.get("tutorId"), 128) || undefined,
        institutionId: financeText(snap.get("institutionId"), 128) || undefined, productId: snap.id,
    };
}
exports.createCommerceCheckout = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, secrets: [FLUTTERWAVE_SECRET_KEY] }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in before checkout.");
    const data = (request.data ?? {});
    const purpose = financeText(data.purpose, 20);
    if (!["subscription", "marketplace"].includes(purpose))
        throw new https_1.HttpsError("invalid-argument", "Invalid commerce purpose.");
    const itemId = purpose === "subscription" ? financeText(data.planId, 160) : financeText(data.productId, 160);
    if (!itemId)
        throw new https_1.HttpsError("invalid-argument", "A plan or product is required.");
    const profile = await financeProfile(request.auth.uid);
    const item = await resolveCommerceItem(purpose, itemId);
    const fullName = financeText(data.fullName, 120) || String(profile.get("fullName") ?? profile.get("name") ?? "Medical Elites User");
    const email = financeText(data.email, 180) || String(profile.get("email") ?? request.auth.token.email ?? "");
    const phoneNumber = financeText(data.phoneNumber, 30);
    const paymentMethod = financeText(data.paymentMethod, 30) || "card";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new https_1.HttpsError("invalid-argument", "A valid billing email is required.");
    if (!["card", "mobile_money"].includes(paymentMethod))
        throw new https_1.HttpsError("invalid-argument", "Unsupported payment method.");
    if (paymentMethod === "mobile_money" && !phoneNumber)
        throw new https_1.HttpsError("invalid-argument", "A Mobile Money number is required.");
    await consumeRateLimit(request.auth.uid, { scope: "commerce_checkout", limit: 10, windowSeconds: 3600 });
    const command = await claimFinanceCommand(request.auth.uid, "commerce_checkout", data.idempotencyKey);
    const txRef = `ME-COM-${request.auth.uid.slice(0, 8)}-${(0, node_crypto_1.randomUUID)().replaceAll("-", "").slice(0, 18)}`;
    const orderRef = db.collection("commerceOrders").doc(txRef);
    const invoiceRef = db.collection("invoices").doc();
    const paymentRef = db.collection("payments").doc(txRef);
    const paymentIntentRef = db.collection("paymentIntents").doc(txRef);
    const now = new Date();
    const invoiceNumber = `ME-${now.getUTCFullYear()}-${invoiceRef.id.slice(0, 8).toUpperCase()}`;
    await db.runTransaction(async (transaction) => {
        transaction.create(orderRef, {
            transactionReference: txRef, purpose, itemId, planId: item.planId ?? null, productId: item.productId ?? null,
            title: item.title, customerUid: request.auth.uid, customerEmail: email, customerName: fullName,
            tenantId: item.tenantId ?? profile.get("institutionId") ?? null, tutorId: item.tutorId ?? null, institutionId: item.institutionId ?? profile.get("institutionId") ?? null,
            amount: { amount: item.amount, currency: item.currency }, status: "pending", invoiceId: invoiceRef.id,
            billingCycle: financeText(data.billingCycle, 20) || null, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.create(invoiceRef, {
            number: invoiceNumber, tenantId: item.tenantId ?? profile.get("institutionId") ?? request.auth.uid,
            billedToUid: request.auth.uid, billedToEmail: email, orderId: txRef, purpose, status: "issued",
            subtotal: { amount: item.amount, currency: item.currency }, discount: { amount: 0, currency: item.currency }, tax: { amount: 0, currency: item.currency }, total: { amount: item.amount, currency: item.currency },
            issuedAt: firestore_1.FieldValue.serverTimestamp(), dueAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.create(paymentRef, {
            orderId: txRef, invoiceId: invoiceRef.id, customerUid: request.auth.uid, provider: "flutterwave", providerReference: txRef,
            status: "pending", amount: { amount: item.amount, currency: item.currency }, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.create(paymentIntentRef, {
            tenantId: item.tenantId ?? profile.get("institutionId") ?? null, payerUserId: request.auth.uid, provider: "flutterwave",
            purpose, amountMinor: Math.round(item.amount * 100), currency: item.currency, status: "pending", externalReference: txRef,
            idempotencyKey: financeText(data.idempotencyKey, 180), orderId: txRef, invoiceId: invoiceRef.id,
            metadata: { planId: item.planId ?? null, productId: item.productId ?? null, paymentMethod },
            createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.update(command, { status: "checkout_created", orderId: txRef, invoiceId: invoiceRef.id, completedAt: firestore_1.FieldValue.serverTimestamp() });
    });
    const secretKey = FLUTTERWAVE_SECRET_KEY.value();
    if (!secretKey)
        throw new https_1.HttpsError("failed-precondition", "Flutterwave is not configured.");
    const returnUrl = safeCommerceReturnUrl(financeText(data.returnUrl, 500));
    const appUrl = process.env.APP_URL || "https://medical-elites-lms.web.app";
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            tx_ref: txRef, amount: item.amount, currency: item.currency,
            redirect_url: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}tx_ref=${encodeURIComponent(txRef)}`,
            payment_options: paymentMethod === "mobile_money" ? "mobilemoneyuganda" : "card",
            customer: { email, name: fullName, phonenumber: phoneNumber || undefined },
            customizations: { title: item.title, description: purpose === "subscription" ? "Medical Elites subscription" : "Medical Elites marketplace purchase", logo: `${appUrl}/images/logo.png` },
            meta: { purpose, orderId: txRef, customerUid: request.auth.uid, planId: item.planId ?? null, productId: item.productId ?? null },
        }),
    });
    const result = await response.json();
    if (!response.ok || result.status !== "success" || !result.data?.link) {
        await Promise.all([
            orderRef.set({ status: "checkout_failed", gatewayMessage: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
            paymentRef.set({ status: "failed", gatewayMessage: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
            paymentIntentRef.set({ status: "failed", lastError: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
        ]);
        throw new https_1.HttpsError("internal", "Unable to create payment checkout.");
    }
    await Promise.all([
        orderRef.set({ checkoutUrlCreated: true, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
        paymentIntentRef.set({ checkoutUrlCreated: true, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
    ]);
    return { checkoutUrl: result.data.link, transactionReference: txRef, invoiceId: invoiceRef.id, paymentIntentId: txRef };
});
exports.createMarketplaceCartCheckout = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, secrets: [FLUTTERWAVE_SECRET_KEY] }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in before checkout.");
    const profile = await financeProfile(request.auth.uid);
    const data = (request.data ?? {});
    const fullName = financeText(data.fullName, 120) || String(profile.get("fullName") ?? profile.get("name") ?? "Medical Elites User");
    const email = financeText(data.email, 180) || String(profile.get("email") ?? request.auth.token.email ?? "");
    const phoneNumber = financeText(data.phoneNumber, 30);
    const paymentMethod = financeText(data.paymentMethod, 30) || "card";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new https_1.HttpsError("invalid-argument", "A valid billing email is required.");
    if (!["card", "mobile_money"].includes(paymentMethod))
        throw new https_1.HttpsError("invalid-argument", "Unsupported payment method.");
    if (paymentMethod === "mobile_money" && !phoneNumber)
        throw new https_1.HttpsError("invalid-argument", "A Mobile Money number is required.");
    await consumeRateLimit(request.auth.uid, { scope: "marketplace_cart_checkout", limit: 10, windowSeconds: 3600 });
    const command = await claimFinanceCommand(request.auth.uid, "marketplace_cart_checkout", data.idempotencyKey);
    const cartRef = db.collection("marketplaceCarts").doc(request.auth.uid);
    const cart = await cartRef.get();
    const rawItems = cart.get("items");
    if (!cart.exists || !Array.isArray(rawItems) || rawItems.length === 0)
        throw new https_1.HttpsError("failed-precondition", "Your marketplace cart is empty.");
    const productIds = [...new Set(rawItems.map(item => financeText(item.productId, 160)).filter(Boolean))];
    if (productIds.length === 0 || productIds.length > 50)
        throw new https_1.HttpsError("invalid-argument", "The cart contains an invalid number of products.");
    const productDocs = await Promise.all(productIds.map(id => db.collection("marketplaceProducts").doc(id).get()));
    const products = productDocs.map(snapshot => {
        if (!snapshot.exists || snapshot.get("status") !== "published")
            throw new https_1.HttpsError("failed-precondition", "One or more products are no longer available.");
        const price = snapshot.get("price");
        return {
            productId: snapshot.id,
            title: String(snapshot.get("title") ?? "Marketplace product"),
            sellerId: financeText(snapshot.get("sellerId"), 128),
            sellerName: financeText(snapshot.get("sellerName"), 160),
            institutionId: financeText(snapshot.get("institutionId"), 128) || null,
            type: financeText(snapshot.get("type"), 40),
            linkedResourceIds: Array.isArray(snapshot.get("linkedResourceIds")) ? snapshot.get("linkedResourceIds") : [],
            accessType: financeText(snapshot.get("accessType"), 40) || "lifetime",
            accessDays: Number(snapshot.get("accessDays") ?? 0) || null,
            price: { amount: financeAmount(price?.amount), currency: financeCurrency(price?.currency) },
        };
    });
    const currencies = [...new Set(products.map(product => product.price.currency))];
    if (currencies.length !== 1)
        throw new https_1.HttpsError("failed-precondition", "All cart products must use the same currency.");
    const currency = currencies[0];
    const amount = products.reduce((sum, product) => sum + product.price.amount, 0);
    if (amount <= 0)
        throw new https_1.HttpsError("failed-precondition", "The cart total must be greater than zero.");
    const txRef = `ME-MKT-${request.auth.uid.slice(0, 8)}-${(0, node_crypto_1.randomUUID)().replaceAll("-", "").slice(0, 18)}`;
    const orderRef = db.collection("commerceOrders").doc(txRef);
    const invoiceRef = db.collection("invoices").doc();
    const paymentRef = db.collection("payments").doc(txRef);
    const paymentIntentRef = db.collection("paymentIntents").doc(txRef);
    const invoiceNumber = `ME-${new Date().getUTCFullYear()}-${invoiceRef.id.slice(0, 8).toUpperCase()}`;
    await db.runTransaction(async (transaction) => {
        transaction.create(orderRef, {
            transactionReference: txRef, purpose: "marketplace", title: products.length === 1 ? products[0].title : `${products.length} marketplace products`,
            customerUid: request.auth.uid, customerEmail: email, customerName: fullName,
            amount: { amount, currency }, status: "pending", invoiceId: invoiceRef.id, itemCount: products.length,
            productIds, items: products, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.create(invoiceRef, {
            number: invoiceNumber, tenantId: profile.get("institutionId") ?? request.auth.uid, billedToUid: request.auth.uid, billedToEmail: email,
            orderId: txRef, purpose: "marketplace", status: "issued", subtotal: { amount, currency }, discount: { amount: 0, currency }, tax: { amount: 0, currency }, total: { amount, currency },
            issuedAt: firestore_1.FieldValue.serverTimestamp(), dueAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.create(paymentRef, { orderId: txRef, invoiceId: invoiceRef.id, customerUid: request.auth.uid, provider: "flutterwave", providerReference: txRef, status: "pending", amount: { amount, currency }, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() });
        transaction.create(paymentIntentRef, { tenantId: profile.get("institutionId") ?? null, payerUserId: request.auth.uid, provider: "flutterwave", purpose: "marketplace_purchase", amountMinor: Math.round(amount * 100), currency, status: "pending", externalReference: txRef, idempotencyKey: financeText(data.idempotencyKey, 180), orderId: txRef, invoiceId: invoiceRef.id, metadata: { productIds, paymentMethod }, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() });
        transaction.update(command, { status: "checkout_created", orderId: txRef, invoiceId: invoiceRef.id, completedAt: firestore_1.FieldValue.serverTimestamp() });
    });
    const secretKey = FLUTTERWAVE_SECRET_KEY.value();
    if (!secretKey)
        throw new https_1.HttpsError("failed-precondition", "Flutterwave is not configured.");
    const returnUrl = safeCommerceReturnUrl(financeText(data.returnUrl, 500));
    const appUrl = process.env.APP_URL || "https://medical-elites-lms.web.app";
    const gateway = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tx_ref: txRef, amount, currency, redirect_url: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}tx_ref=${encodeURIComponent(txRef)}`, payment_options: paymentMethod === "mobile_money" ? "mobilemoneyuganda" : "card", customer: { email, name: fullName, phonenumber: phoneNumber || undefined }, customizations: { title: "Medical Elites Marketplace", description: `${products.length} marketplace product(s)`, logo: `${appUrl}/images/logo.png` }, meta: { purpose: "marketplace", orderId: txRef, customerUid: request.auth.uid, productIds } }),
    });
    const result = await gateway.json();
    if (!gateway.ok || result.status !== "success" || !result.data?.link) {
        await Promise.all([orderRef.set({ status: "checkout_failed", gatewayMessage: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }), paymentRef.set({ status: "failed", gatewayMessage: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }), paymentIntentRef.set({ status: "failed", lastError: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true })]);
        throw new https_1.HttpsError("internal", "Unable to create marketplace checkout.");
    }
    await Promise.all([orderRef.set({ checkoutUrlCreated: true, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }), paymentIntentRef.set({ checkoutUrlCreated: true, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true })]);
    return { checkoutUrl: result.data.link, transactionReference: txRef, invoiceId: invoiceRef.id, paymentIntentId: txRef };
});
async function fulfilCommerceOrder(orderRef, transactionId, verified, eventName) {
    const order = await orderRef.get();
    if (!order.exists)
        throw new Error("Unknown commerce order.");
    if (order.get("status") === "fulfilled")
        return;
    const txRef = order.id;
    const expected = order.get("amount");
    const expectedAmount = Number(expected?.amount ?? 0);
    const expectedCurrency = String(expected?.currency ?? "");
    if (verified.status !== "successful" || verified.tx_ref !== txRef || verified.currency !== expectedCurrency || Number(verified.amount ?? 0) < expectedAmount) {
        await orderRef.set({ status: "verification_failed", updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        throw new Error("Verified transaction does not match the order.");
    }
    const invoiceId = String(order.get("invoiceId") ?? "");
    const paymentRef = db.collection("payments").doc(txRef);
    const paymentIntentRef = db.collection("paymentIntents").doc(txRef);
    const receiptRef = db.collection("receipts").doc(txRef);
    await db.runTransaction(async (transaction) => {
        const freshOrder = await transaction.get(orderRef);
        if (freshOrder.get("status") === "fulfilled")
            return;
        transaction.update(orderRef, { status: "fulfilled", fulfilledAt: firestore_1.FieldValue.serverTimestamp(), flutterwaveTransactionId: transactionId, flutterwaveReference: verified.flw_ref ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        transaction.set(paymentRef, { status: "successful", providerTransactionId: transactionId, providerReference: verified.flw_ref ?? txRef, verifiedAmount: verified.amount ?? null, verifiedCurrency: verified.currency ?? null, paymentType: verified.payment_type ?? null, paidAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        transaction.set(paymentIntentRef, { status: "successful", providerTransactionId: transactionId, providerReference: verified.flw_ref ?? txRef, verifiedAmountMinor: Math.round(Number(verified.amount ?? 0) * 100), verifiedCurrency: verified.currency ?? null, paidAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        if (invoiceId)
            transaction.set(db.collection("invoices").doc(invoiceId), { status: "paid", paidAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        transaction.set(receiptRef, { number: `ME-RCT-${txRef.slice(-12).toUpperCase()}`, orderId: txRef, invoiceId: invoiceId || null, customerUid: freshOrder.get("customerUid"), customerEmail: freshOrder.get("customerEmail"), amount: freshOrder.get("amount"), provider: "flutterwave", providerTransactionId: transactionId, event: eventName, issuedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        if (freshOrder.get("purpose") === "subscription") {
            const subscriptionId = safeFinanceId(`${freshOrder.get("customerUid")}_${freshOrder.get("planId")}`);
            const now = new Date();
            const end = new Date(now);
            const cycle = String(freshOrder.get("billingCycle") ?? "monthly");
            if (cycle === "annual")
                end.setUTCFullYear(end.getUTCFullYear() + 1);
            else if (cycle === "quarterly")
                end.setUTCMonth(end.getUTCMonth() + 3);
            else
                end.setUTCMonth(end.getUTCMonth() + 1);
            transaction.set(db.collection("subscriptions").doc(subscriptionId), { tenantId: freshOrder.get("tenantId") ?? freshOrder.get("customerUid"), customerUid: freshOrder.get("customerUid"), planId: freshOrder.get("planId"), status: "active", startedAt: firestore_1.FieldValue.serverTimestamp(), currentPeriodStart: now.toISOString(), currentPeriodEnd: end.toISOString(), autoRenew: false, lastPaymentId: txRef, updatedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
            transaction.set(db.collection("licenseGrants").doc(subscriptionId), { tenantId: freshOrder.get("tenantId") ?? freshOrder.get("customerUid"), userId: freshOrder.get("customerUid"), planId: freshOrder.get("planId"), status: "active", source: "flutterwave", expiresAt: end.toISOString(), updatedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        }
        else {
            const customerUid = String(freshOrder.get("customerUid") ?? "");
            const orderItems = Array.isArray(freshOrder.get("items")) ? freshOrder.get("items") : [{ productId: freshOrder.get("productId") }];
            for (const item of orderItems) {
                const productId = financeText(item.productId, 160);
                if (!productId)
                    continue;
                const entitlementId = safeFinanceId(`${customerUid}_${productId}`);
                const accessType = financeText(item.accessType, 40) || "lifetime";
                const accessDays = Number(item.accessDays ?? 0);
                const expiresAt = accessType === "fixed_term" && accessDays > 0 ? new Date(Date.now() + accessDays * 86400000).toISOString() : null;
                transaction.set(db.collection("commerceEntitlements").doc(entitlementId), { customerUid, productId, orderId: txRef, status: "active", accessType, expiresAt, grantedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                transaction.set(db.collection("productEntitlements").doc(entitlementId), { customerUid, productId, orderId: txRef, status: "active", accessType, expiresAt, startsAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                transaction.set(db.collection("marketplacePurchases").doc(`${txRef}_${productId}`), { customerUid, orderId: txRef, productId, sellerId: financeText(item.sellerId, 128), institutionId: financeText(item.institutionId, 128) || null, amount: item.price ?? null, entitlementId, status: "active", createdAt: firestore_1.FieldValue.serverTimestamp() });
                transaction.set(db.collection("marketplaceEnrollments").doc(entitlementId), { customerUid, productId, orderId: txRef, linkedResourceIds: Array.isArray(item.linkedResourceIds) ? item.linkedResourceIds : [], productType: financeText(item.type, 40), status: "active", enrolledAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                transaction.set(db.collection("marketplaceProducts").doc(productId), { salesCount: firestore_1.FieldValue.increment(1), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                const linkedIds = Array.isArray(item.linkedResourceIds) ? item.linkedResourceIds.filter((value) => typeof value === "string") : [];
                if (["course", "course_unit", "bundle"].includes(financeText(item.type, 40)) && linkedIds.length > 0) {
                    transaction.set(db.collection("users").doc(customerUid), { assignedCourseUnitIds: firestore_1.FieldValue.arrayUnion(...linkedIds), enrolledCourses: firestore_1.FieldValue.arrayUnion(...linkedIds), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                    transaction.set(db.collection("students").doc(customerUid), { assignedCourseUnitIds: firestore_1.FieldValue.arrayUnion(...linkedIds), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                }
            }
            transaction.set(db.collection("marketplaceCarts").doc(customerUid), { items: [], currency: null, lastOrderId: txRef, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        }
        transaction.set(db.collection("financeEvents").doc(), { type: "commerce.payment_verified", aggregateId: txRef, transactionId, purpose: freshOrder.get("purpose"), customerUid: freshOrder.get("customerUid"), amount: freshOrder.get("amount"), createdAt: firestore_1.FieldValue.serverTimestamp() });
    });
}
exports.flutterwaveCommerceWebhook = (0, https_1.onRequest)({ region: "us-central1", timeoutSeconds: 60, secrets: [FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_WEBHOOK_SECRET] }, async (request, response) => {
    const secretHash = FLUTTERWAVE_WEBHOOK_SECRET.value();
    const signature = String(request.header("flutterwave-signature") || "");
    const legacy = String(request.header("verif-hash") || "");
    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
    const calculated = secretHash ? (0, node_crypto_1.createHmac)("sha256", secretHash).update(rawBody).digest("base64") : "";
    const hmacMatches = Boolean(signature && calculated && Buffer.byteLength(signature) === Buffer.byteLength(calculated) && (0, node_crypto_1.timingSafeEqual)(Buffer.from(signature), Buffer.from(calculated)));
    const legacyMatches = Boolean(secretHash && legacy && Buffer.byteLength(legacy) === Buffer.byteLength(secretHash) && (0, node_crypto_1.timingSafeEqual)(Buffer.from(legacy), Buffer.from(secretHash)));
    if (!secretHash || (!hmacMatches && !legacyMatches)) {
        response.status(401).send("Invalid webhook signature");
        return;
    }
    const body = request.body;
    const eventData = body.data ?? {};
    const txRef = financeText(eventData.tx_ref ?? eventData.reference, 180);
    const transactionId = financeText(eventData.id, 80);
    if (!txRef || !transactionId) {
        response.status(200).send("Ignored");
        return;
    }
    const receiptRef = db.collection("webhookReceipts").doc(`commerce_flutterwave_${transactionId}`);
    const webhookEventRef = db.collection("paymentWebhookEvents").doc(`flutterwave_${transactionId}`);
    await webhookEventRef.set({ provider: "flutterwave", providerEventId: transactionId, externalReference: txRef, eventType: body.event ?? body.type ?? null, signatureVerified: true, processingStatus: "received", retryCount: firestore_1.FieldValue.increment(1), receivedAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    const receipt = await receiptRef.get();
    if (receipt.get("processed") === true) {
        response.status(200).send("Already processed");
        return;
    }
    const orderRef = db.collection("commerceOrders").doc(txRef);
    if (!(await orderRef.get()).exists) {
        response.status(200).send("Unknown reference");
        return;
    }
    try {
        const verified = await verifyFlutterwaveTransaction(transactionId);
        await fulfilCommerceOrder(orderRef, transactionId, verified, body.event ?? body.type ?? "unknown");
        await Promise.all([
            receiptRef.set({ provider: "flutterwave", transactionId, txRef, processed: true, receivedAt: firestore_1.FieldValue.serverTimestamp(), event: body.event ?? body.type ?? null }, { merge: true }),
            webhookEventRef.set({ processingStatus: "processed", processedAt: firestore_1.FieldValue.serverTimestamp(), lastError: null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
        ]);
        response.status(200).send("OK");
    }
    catch (error) {
        console.error("Commerce webhook processing failed", { txRef, transactionId, message: error instanceof Error ? error.message : "unknown" });
        await Promise.all([
            receiptRef.set({ provider: "flutterwave", transactionId, txRef, processed: false, failedAt: firestore_1.FieldValue.serverTimestamp(), event: body.event ?? body.type ?? null }, { merge: true }),
            webhookEventRef.set({ processingStatus: "failed", lastError: error instanceof Error ? error.message : "Unknown webhook processing error", failedAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true }),
        ]);
        response.status(200).send("Verification failed");
    }
});
exports.reconcileCommercePayment = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, secrets: [FLUTTERWAVE_SECRET_KEY] }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    const data = (request.data ?? {});
    const txRef = financeText(data.transactionReference, 180);
    const transactionId = financeText(data.transactionId, 80);
    if (!txRef || !transactionId)
        throw new https_1.HttpsError("invalid-argument", "Transaction reference and Flutterwave transaction ID are required.");
    const orderRef = db.collection("commerceOrders").doc(txRef);
    const order = await orderRef.get();
    if (!order.exists)
        throw new https_1.HttpsError("not-found", "Payment order was not found.");
    const profile = await financeProfile(request.auth.uid);
    const isAdmin = profile.get("role") === "admin" && ["super_admin", "platform_finance"].includes(String(profile.get("platformRole") ?? ""));
    if (!isAdmin && order.get("customerUid") !== request.auth.uid)
        throw new https_1.HttpsError("permission-denied", "You cannot reconcile this payment.");
    await consumeRateLimit(request.auth.uid, { scope: "commerce_reconcile", limit: 10, windowSeconds: 3600 });
    const verified = await verifyFlutterwaveTransaction(transactionId);
    await fulfilCommerceOrder(orderRef, transactionId, verified, "manual.reconciliation");
    return { status: "fulfilled", transactionReference: txRef };
});
exports.requestCommerceRefund = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, secrets: [FLUTTERWAVE_SECRET_KEY] }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const txRef = financeText(data.transactionReference, 180);
    const amount = financeAmount(data.amount);
    const comments = financeText(data.comments, 300) || "Medical Elites refund";
    const payment = await db.collection("payments").doc(txRef).get();
    if (!payment.exists || payment.get("status") !== "successful")
        throw new https_1.HttpsError("failed-precondition", "Only successful payments can be refunded.");
    const transactionId = financeText(payment.get("providerTransactionId"), 80);
    if (!transactionId)
        throw new https_1.HttpsError("failed-precondition", "The Flutterwave transaction ID is missing.");
    const original = payment.get("amount");
    if (amount > Number(original?.amount ?? 0))
        throw new https_1.HttpsError("invalid-argument", "Refund cannot exceed the original payment.");
    const command = await claimFinanceCommand(request.auth.uid, "commerce_refund", data.idempotencyKey);
    const apiResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/refund`, {
        method: "POST", headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY.value()}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount, comments }),
    });
    const result = await apiResponse.json();
    if (!apiResponse.ok || result.status !== "success") {
        await command.set({ status: "failed", message: result.message ?? null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        throw new https_1.HttpsError("internal", "Flutterwave refund initiation failed.");
    }
    const refundRef = db.collection("refunds").doc();
    await refundRef.set({ orderId: txRef, paymentId: payment.id, customerUid: payment.get("customerUid"), provider: "flutterwave", providerRefundId: result.data?.id ?? null, providerTransactionId: transactionId, amount: { amount, currency: String(original?.currency ?? "UGX") }, status: String(result.data?.status ?? "processing"), comments, requestedBy: request.auth.uid, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() });
    await payment.ref.set({ refundStatus: "processing", refundedAmount: firestore_1.FieldValue.increment(amount), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await command.set({ status: "completed", refundId: refundRef.id, completedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    return { refundId: refundRef.id, status: String(result.data?.status ?? "processing") };
});
function marketplaceNumber(value, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max)
        throw new https_1.HttpsError("invalid-argument", `Value must be between ${min} and ${max}.`);
    return parsed;
}
exports.submitMarketplaceReview = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 30 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await consumeRateLimit(request.auth.uid, { scope: "marketplace_review", limit: 12, windowSeconds: 3600 });
    const data = (request.data ?? {});
    const productId = financeText(data.productId, 128);
    const purchaseId = financeText(data.purchaseId, 180);
    const rating = marketplaceNumber(data.rating, 1, 5);
    const difficulty = marketplaceNumber(data.difficulty, 1, 5);
    const valueForMoney = marketplaceNumber(data.valueForMoney, 1, 5);
    const title = financeText(data.title, 120);
    const body = financeText(data.body, 2000);
    if (!productId || !purchaseId || !body)
        throw new https_1.HttpsError("invalid-argument", "Product, purchase and review text are required.");
    const purchase = await db.collection("marketplacePurchases").doc(purchaseId).get();
    if (!purchase.exists || purchase.get("customerUid") !== request.auth.uid || purchase.get("productId") !== productId || purchase.get("status") !== "active") {
        throw new https_1.HttpsError("permission-denied", "Only verified purchasers may review this product.");
    }
    const reviewId = `${request.auth.uid}_${productId}`;
    const reviewRef = db.collection("productReviews").doc(reviewId);
    const profile = await financeProfile(request.auth.uid);
    await db.runTransaction(async (transaction) => {
        const existing = await transaction.get(reviewRef);
        const productRef = db.collection("marketplaceProducts").doc(productId);
        const product = await transaction.get(productRef);
        if (!product.exists)
            throw new https_1.HttpsError("not-found", "Marketplace product was not found.");
        transaction.set(reviewRef, {
            productId, purchaseId, reviewerId: request.auth.uid,
            reviewerName: financeText(profile.get("fullName") ?? profile.get("displayName") ?? request.auth.token.email, 120) || "Verified learner",
            rating, title, body, difficulty, valueForMoney, wouldRecommend: data.wouldRecommend === true,
            verifiedPurchase: true, helpfulCount: existing.exists ? Number(existing.get("helpfulCount") ?? 0) : 0,
            notHelpfulCount: existing.exists ? Number(existing.get("notHelpfulCount") ?? 0) : 0,
            status: "published", createdAt: existing.exists ? existing.get("createdAt") : firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        const oldRating = existing.exists ? Number(existing.get("rating") ?? 0) : 0;
        const count = Math.max(0, Number(product.get("ratingCount") ?? 0) + (existing.exists ? 0 : 1));
        const currentTotal = Number(product.get("ratingAverage") ?? 0) * Number(product.get("ratingCount") ?? 0);
        const nextTotal = Math.max(0, currentTotal - oldRating + rating);
        transaction.set(productRef, { ratingCount: count, ratingAverage: count ? nextTotal / count : 0, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
        transaction.set(db.collection("productRatingSummaries").doc(productId), { productId, average: count ? nextTotal / count : 0, count, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    });
    return { reviewId };
});
exports.voteMarketplaceReview = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 20 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    const data = (request.data ?? {});
    const reviewId = financeText(data.reviewId, 180);
    const helpful = data.helpful === true;
    if (!reviewId)
        throw new https_1.HttpsError("invalid-argument", "Review ID is required.");
    const voteRef = db.collection("productReviewVotes").doc(`${reviewId}_${request.auth.uid}`);
    const reviewRef = db.collection("productReviews").doc(reviewId);
    await db.runTransaction(async (transaction) => {
        const [review, previous] = await Promise.all([transaction.get(reviewRef), transaction.get(voteRef)]);
        if (!review.exists || review.get("status") !== "published")
            throw new https_1.HttpsError("not-found", "Review was not found.");
        const previousHelpful = previous.exists ? previous.get("helpful") === true : null;
        if (previousHelpful === helpful)
            return;
        const updates = { updatedAt: firestore_1.FieldValue.serverTimestamp() };
        if (previousHelpful === true)
            updates.helpfulCount = firestore_1.FieldValue.increment(-1);
        if (previousHelpful === false)
            updates.notHelpfulCount = firestore_1.FieldValue.increment(-1);
        if (helpful)
            updates.helpfulCount = firestore_1.FieldValue.increment(1);
        else
            updates.notHelpfulCount = firestore_1.FieldValue.increment(1);
        transaction.set(reviewRef, updates, { merge: true });
        transaction.set(voteRef, { reviewId, voterUid: request.auth.uid, helpful, updatedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: previous.exists ? previous.get("createdAt") : firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    });
    return { status: "recorded" };
});
exports.moderateMarketplaceReview = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 20 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const reviewId = financeText(data.reviewId, 180);
    const status = financeText(data.status, 20);
    if (!reviewId || !["published", "hidden"].includes(status))
        throw new https_1.HttpsError("invalid-argument", "Valid review and status are required.");
    await db.collection("productReviews").doc(reviewId).set({ status, moderatedBy: request.auth.uid, moderatedAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await db.collection("marketplaceModeration").add({ entityType: "review", entityId: reviewId, action: status, actorUid: request.auth.uid, createdAt: firestore_1.FieldValue.serverTimestamp() });
    return { status };
});
exports.upsertMarketplacePromotion = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 20 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const id = financeText(data.id, 128) || db.collection("marketplacePromotions").doc().id;
    const name = financeText(data.name, 140);
    const kind = financeText(data.kind, 40);
    const targetId = financeText(data.targetId, 180);
    if (!name || !["featured_product", "featured_seller", "banner", "flash_sale"].includes(kind))
        throw new https_1.HttpsError("invalid-argument", "Promotion name and type are required.");
    await db.collection("marketplacePromotions").doc(id).set({ name, kind, targetId, status: financeText(data.status, 20) || "draft", priority: Math.max(0, Number(data.priority ?? 0)), startsAt: data.startsAt ?? null, endsAt: data.endsAt ?? null, createdBy: request.auth.uid, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    return { promotionId: id };
});
exports.upsertMarketplaceCoupon = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 20 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const code = financeText(data.code, 40).toUpperCase();
    const type = financeText(data.type, 20);
    const value = marketplaceNumber(data.value, 0.01, 1000000000);
    if (!code || !["percentage", "fixed"].includes(type) || (type === "percentage" && value > 100))
        throw new https_1.HttpsError("invalid-argument", "A valid coupon is required.");
    const id = financeText(data.id, 128) || code;
    await db.collection("marketplaceCoupons").doc(id).set({ code, type, value, currency: financeText(data.currency, 3) || "UGX", scope: financeText(data.scope, 30) || "global", targetId: financeText(data.targetId, 180) || null, minimumSpend: Math.max(0, Number(data.minimumSpend ?? 0)), maxDiscount: Math.max(0, Number(data.maxDiscount ?? 0)) || null, usageLimit: Math.max(0, Number(data.usageLimit ?? 0)) || null, redemptions: firestore_1.FieldValue.increment(0), status: financeText(data.status, 20) || "draft", startsAt: data.startsAt ?? null, endsAt: data.endsAt ?? null, createdBy: request.auth.uid, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    return { couponId: id };
});
exports.reviewMarketplaceSellerVerification = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 20 }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Please sign in.");
    await assertFinancePlatformAdmin(request.auth.uid);
    const data = (request.data ?? {});
    const sellerId = financeText(data.sellerId, 128);
    const status = financeText(data.status, 20);
    if (!sellerId || !["verified", "rejected", "suspended"].includes(status))
        throw new https_1.HttpsError("invalid-argument", "Seller and status are required.");
    const badge = financeText(data.badge, 40) || "verified_tutor";
    await db.collection("sellerVerifications").doc(sellerId).set({ sellerId, sellerType: financeText(data.sellerType, 30) || "tutor", status, badge, reviewedBy: request.auth.uid, reviewedAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await db.collection("sellerProfiles").doc(sellerId).set({ verified: status === "verified", verificationBadge: status === "verified" ? badge : null, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    return { status };
});
function finiteNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function callableDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime()))
        return value;
    if (typeof value === "string" || typeof value === "number") {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime()))
            return parsed;
    }
    if (value && typeof value === "object" && "seconds" in value) {
        const seconds = finiteNumber(value.seconds);
        return new Date(seconds * 1000);
    }
    return new Date();
}
/**
 * Trusted quiz submission endpoint. The attempt counter and completed attempt
 * are committed in one transaction so refreshes, multiple browsers and direct
 * calls cannot exceed the tutor-defined limit.
 */
exports.submitQuizAttempt = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Please sign in before submitting this quiz.");
    }
    const uid = request.auth.uid;
    const authenticatedEmail = typeof request.auth.token.email === "string" ? request.auth.token.email : "";
    const data = (request.data ?? {});
    const quizId = asText(data.quizId, 200);
    if (!quizId) {
        throw new https_1.HttpsError("invalid-argument", "A quiz ID is required.");
    }
    const profile = await db.doc(`users/${uid}`).get();
    if (!profile.exists || profile.get("isActive") === false || profile.get("role") !== "student") {
        throw new https_1.HttpsError("permission-denied", "Only active students can submit quiz attempts.");
    }
    const quizRef = db.doc(`quizzes/${quizId}`);
    const counterRef = db.doc(`quizAttemptCounters/${uid}_${quizId}`);
    const attemptRef = db.collection("quizAttempts").doc((0, node_crypto_1.randomUUID)());
    return db.runTransaction(async (transaction) => {
        const quizSnapshot = await transaction.get(quizRef);
        if (!quizSnapshot.exists) {
            throw new https_1.HttpsError("not-found", "This quiz no longer exists.");
        }
        const quiz = quizSnapshot.data() ?? {};
        if (quiz.status !== "published") {
            throw new https_1.HttpsError("failed-precondition", "This quiz is not currently available.");
        }
        const configuredAttempts = Math.floor(finiteNumber(quiz.attemptsAllowed, 1));
        const maximumAttempts = Math.max(configuredAttempts, 1);
        const attemptsSnapshot = await transaction.get(db.collection("quizAttempts")
            .where("studentId", "==", uid)
            .where("quizId", "==", quizId));
        const existingAttempts = attemptsSnapshot.docs.filter((item) => {
            const attempt = item.data();
            return attempt.completed !== false;
        }).length;
        const counterSnapshot = await transaction.get(counterRef);
        const counterUsed = counterSnapshot.exists
            ? Math.max(0, Math.floor(finiteNumber(counterSnapshot.get("attemptsUsed"), 0)))
            : 0;
        const attemptsUsed = Math.max(existingAttempts, counterUsed);
        if (attemptsUsed >= maximumAttempts) {
            throw new https_1.HttpsError("resource-exhausted", "You have used all the attempts allowed for this quiz.");
        }
        const nextUsed = attemptsUsed + 1;
        const score = Math.max(0, finiteNumber(data.score));
        const totalMarks = Math.max(0, finiteNumber(data.totalMarks, finiteNumber(quiz.totalMarks)));
        const percentage = Math.max(0, Math.min(100, finiteNumber(data.percentage)));
        const passMark = Math.max(0, Math.min(100, finiteNumber(quiz.passMark, 50)));
        const passed = percentage >= passMark;
        const moduleId = asText(quiz.moduleId ?? data.moduleId, 200);
        const courseUnitId = asText(quiz.courseUnitId ?? data.courseUnitId, 200);
        const enrollmentRefs = new Map();
        if (passed && moduleId) {
            const enrollmentQueries = await Promise.all([
                transaction.get(db.collection("enrollments").where("userId", "==", uid)),
                transaction.get(db.collection("enrollments").where("studentAuthUid", "==", uid)),
            ]);
            for (const snapshot of enrollmentQueries) {
                for (const enrollmentDoc of snapshot.docs) {
                    const enrollment = enrollmentDoc.data();
                    const belongs = !courseUnitId
                        || enrollment.courseId === courseUnitId
                        || enrollment.courseUnitId === courseUnitId
                        || (Array.isArray(enrollment.courseUnitIds) && enrollment.courseUnitIds.includes(courseUnitId));
                    if (belongs)
                        enrollmentRefs.set(enrollmentDoc.ref.path, enrollmentDoc.ref);
                }
            }
        }
        transaction.set(attemptRef, {
            id: attemptRef.id,
            quizId,
            quizTitle: asText(quiz.title ?? data.quizTitle, 500),
            studentId: uid,
            studentName: String((profile.get("fullName") ?? authenticatedEmail) || "Student"),
            programmeId: asText(quiz.programmeId ?? data.programmeId, 200) || null,
            programmeTitle: asText(quiz.programmeTitle ?? data.programmeTitle, 500) || null,
            courseUnitId: courseUnitId || null,
            courseUnitTitle: asText(quiz.courseUnitTitle ?? data.courseUnitTitle, 500) || null,
            moduleId: moduleId || null,
            moduleTitle: asText(quiz.moduleTitle ?? data.moduleTitle, 500) || null,
            tutorUid: asText(quiz.ownerUserId ?? quiz.createdByUid ?? quiz.tutorUid, 200) || null,
            ownerUserId: asText(quiz.ownerUserId ?? quiz.createdByUid ?? quiz.tutorUid, 200) || null,
            createdByUid: asText(quiz.createdByUid ?? quiz.ownerUserId ?? quiz.tutorUid, 200) || null,
            tenantId: asText(quiz.tenantId ?? quiz.institutionId, 200) || null,
            institutionId: asText(quiz.institutionId, 200) || null,
            startedAt: callableDate(data.startedAt),
            submittedAt: firestore_1.FieldValue.serverTimestamp(),
            durationSeconds: Math.max(0, Math.floor(finiteNumber(data.durationSeconds))),
            answers: Array.isArray(data.answers) ? data.answers : [],
            score,
            totalMarks,
            percentage,
            manualMarks: [],
            manualScore: 0,
            finalScore: score,
            finalPercentage: percentage,
            passed,
            completed: true,
            attemptNumber: nextUsed,
            maximumAttempts,
            tutorRemarks: "",
            released: false,
            releasedAt: null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        transaction.set(counterRef, {
            studentId: uid,
            quizId,
            attemptsUsed: nextUsed,
            maximumAttempts,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        for (const enrollmentRef of enrollmentRefs.values()) {
            transaction.set(enrollmentRef, {
                completedModules: firestore_1.FieldValue.arrayUnion(moduleId),
                startedModules: firestore_1.FieldValue.arrayUnion(moduleId),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        return {
            attemptId: attemptRef.id,
            attemptsUsed: nextUsed,
            maximumAttempts,
            attemptsRemaining: Math.max(maximumAttempts - nextUsed, 0),
        };
    });
});
/** Persist completion of a module after validating any required quiz. */
exports.completeModuleLearning = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Please sign in before completing this module.");
    }
    const uid = request.auth.uid;
    const moduleId = asText(request.data?.moduleId, 200);
    if (!moduleId)
        throw new https_1.HttpsError("invalid-argument", "A module ID is required.");
    const moduleSnapshot = await db.doc(`modules/${moduleId}`).get();
    if (!moduleSnapshot.exists)
        throw new https_1.HttpsError("not-found", "Module not found.");
    const moduleData = moduleSnapshot.data() ?? {};
    const courseUnitId = asText(moduleData.courseUnitId ?? moduleData.courseId, 200);
    if (moduleData.quizRequired === true) {
        const quizzes = await db.collection("quizzes").where("moduleId", "==", moduleId).get();
        const publishedQuizIds = quizzes.docs
            .filter((item) => item.get("status") === "published")
            .map((item) => item.id);
        if (publishedQuizIds.length > 0) {
            const attempts = await db.collection("quizAttempts").where("studentId", "==", uid).get();
            const passed = attempts.docs.some((item) => {
                const attempt = item.data();
                return publishedQuizIds.includes(String(attempt.quizId ?? ""))
                    && attempt.completed !== false
                    && (attempt.passed === true || finiteNumber(attempt.finalPercentage ?? attempt.percentage) >= finiteNumber(moduleData.passMark, 50));
            });
            if (!passed) {
                throw new https_1.HttpsError("failed-precondition", "Pass the required module quiz before completing this module.");
            }
        }
    }
    const [byUser, byAuthUid] = await Promise.all([
        db.collection("enrollments").where("userId", "==", uid).get(),
        db.collection("enrollments").where("studentAuthUid", "==", uid).get(),
    ]);
    const refs = new Map();
    for (const snapshot of [byUser, byAuthUid]) {
        for (const item of snapshot.docs) {
            const enrollment = item.data();
            const belongs = !courseUnitId
                || enrollment.courseId === courseUnitId
                || enrollment.courseUnitId === courseUnitId
                || (Array.isArray(enrollment.courseUnitIds) && enrollment.courseUnitIds.includes(courseUnitId));
            if (belongs)
                refs.set(item.ref.path, item.ref);
        }
    }
    if (refs.size === 0)
        throw new https_1.HttpsError("failed-precondition", "Active enrolment not found.");
    const moduleQuery = courseUnitId
        ? await db.collection("modules").where("courseUnitId", "==", courseUnitId).get()
        : null;
    const publishedModuleCount = moduleQuery
        ? moduleQuery.docs.filter((item) => item.get("published") === true).length
        : 0;
    const batch = db.batch();
    for (const ref of refs.values()) {
        const enrollmentSnapshot = await ref.get();
        const existingCompleted = new Set(Array.isArray(enrollmentSnapshot.get("completedModules"))
            ? enrollmentSnapshot.get("completedModules")
            : []);
        existingCompleted.add(moduleId);
        const progress = publishedModuleCount > 0
            ? Math.min(100, Math.round((existingCompleted.size / publishedModuleCount) * 100))
            : enrollmentSnapshot.get("progress") ?? 0;
        batch.set(ref, {
            completedModules: firestore_1.FieldValue.arrayUnion(moduleId),
            startedModules: firestore_1.FieldValue.arrayUnion(moduleId),
            progress,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    await batch.commit();
    return { moduleId, completed: true };
});
/**
 * Creates the canonical tenant and membership records required by v3 without
 * deleting or renaming any legacy institution-scoped data.
 *
 * Institution tenant IDs intentionally reuse institutionId. Independent tutor
 * workspaces use tutor_{uid}. The operation is idempotent and trusted-server
 * only; browser clients cannot assign themselves privileged tenant roles.
 */
exports.bootstrapTenantWorkspace = (0, https_1.onCall)({
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
    enforceAppCheck: false,
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Sign in before initializing a workspace.");
    }
    await consumeRateLimit(request.auth.uid, {
        scope: "tenant_bootstrap",
        limit: 5,
        windowSeconds: 60,
    });
    const uid = request.auth.uid;
    const userRef = db.collection("users").doc(uid);
    return db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        if (!userSnapshot.exists || userSnapshot.get("isActive") === false) {
            throw new https_1.HttpsError("permission-denied", "Your active user profile is required.");
        }
        const role = String(userSnapshot.get("role") ?? "student");
        const institutionId = String(userSnapshot.get("institutionId") ?? "").trim();
        if (!institutionId && role !== "tutor") {
            throw new https_1.HttpsError("failed-precondition", "An institution assignment is required before this account can receive a workspace.");
        }
        const tenantId = institutionId || `tutor_${uid}`;
        const membershipId = `${tenantId}_${uid}`;
        const tenantRef = db.collection("tenants").doc(tenantId);
        const membershipRef = db.collection("tenantMemberships").doc(membershipId);
        const [tenantSnapshot, membershipSnapshot] = await Promise.all([
            transaction.get(tenantRef),
            transaction.get(membershipRef),
        ]);
        const tenantType = institutionId ? "institution" : "independent_tutor";
        const institutionName = String(userSnapshot.get("institutionName") ?? "").trim();
        const fullName = String(userSnapshot.get("fullName") ?? "").trim();
        const tenantName = institutionName || (institutionId ? "Institution workspace" : `${fullName || "Tutor"} workspace`);
        const tenantRole = !institutionId
            ? "owner"
            : role === "admin"
                ? "institution_admin"
                : role === "tutor"
                    ? "tutor"
                    : "student";
        if (!tenantSnapshot.exists) {
            transaction.create(tenantRef, {
                type: tenantType,
                name: tenantName,
                slug: tenantId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                status: "active",
                ownerUserId: !institutionId || role === "admin" ? uid : null,
                planId: institutionId ? "institution_free" : "tutor_free",
                legacyInstitutionId: institutionId || null,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        if (!membershipSnapshot.exists) {
            transaction.create(membershipRef, {
                tenantId,
                userId: uid,
                roles: [tenantRole],
                status: "active",
                isDefault: true,
                joinedAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        transaction.set(userRef, {
            tenantId,
            tenantIds: firestore_1.FieldValue.arrayUnion(tenantId),
            activeTenantId: tenantId,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return {
            tenantId,
            membershipId,
            createdTenant: !tenantSnapshot.exists,
            createdMembership: !membershipSnapshot.exists,
        };
    });
});
const TENANT_STATUSES = new Set(["trial", "active", "suspended", "past_due", "cancelled", "archived"]);
const TENANT_TYPES = new Set(["institution", "independent_tutor"]);
function requiredString(value, field, maxLength = 200) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text)
        throw new https_1.HttpsError("invalid-argument", `${field} is required.`);
    return text.slice(0, maxLength);
}
function optionalString(value, maxLength = 500) {
    return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : null;
}
function tenantSlug(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
async function assertPlatformSuperAdmin(request) {
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Sign in before managing tenants.");
    const profile = await db.collection("users").doc(request.auth.uid).get();
    const platformRole = String(profile.get("platformRole") ?? "");
    const role = String(profile.get("role") ?? "");
    const email = String(request.auth.token.email ?? profile.get("email") ?? "").toLowerCase();
    if (role !== "admin" || (platformRole !== "super_admin" && email !== "othienoivan@gmail.com")) {
        throw new https_1.HttpsError("permission-denied", "Platform Super Admin access is required.");
    }
    return { uid: request.auth.uid, name: String(profile.get("fullName") ?? email ?? request.auth.uid) };
}
async function writePlatformAudit(actor, action, tenantId, summary, metadata = {}) {
    await db.collection("platformAuditLogs").add({
        actorUid: actor.uid,
        actorName: actor.name,
        action,
        entityType: "tenant",
        entityId: tenantId,
        tenantId,
        summary,
        metadata,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
}
exports.createTenant = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const name = requiredString(data.name, "Tenant name", 160);
    const type = requiredString(data.type, "Tenant type", 40);
    if (!TENANT_TYPES.has(type))
        throw new https_1.HttpsError("invalid-argument", "Unsupported tenant type.");
    const slug = tenantSlug(name);
    if (!slug)
        throw new https_1.HttpsError("invalid-argument", "Tenant name cannot produce a valid slug.");
    const duplicate = await db.collection("tenants").where("slug", "==", slug).limit(1).get();
    if (!duplicate.empty)
        throw new https_1.HttpsError("already-exists", "A tenant with this name or slug already exists.");
    const tenantRef = db.collection("tenants").doc();
    const ownerUserId = optionalString(data.ownerUserId, 128);
    const batch = db.batch();
    batch.create(tenantRef, {
        name, slug, type, status: "trial", ownerUserId,
        country: optionalString(data.country, 100), currency: optionalString(data.currency, 10) ?? "UGX",
        contactEmail: optionalString(data.contactEmail, 200), contactPhone: optionalString(data.contactPhone, 50),
        planId: optionalString(data.planId, 100), branding: typeof data.branding === "object" && data.branding ? data.branding : {},
        createdByUid: actor.uid, createdAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    if (ownerUserId) {
        batch.set(db.collection("tenantMemberships").doc(`${tenantRef.id}_${ownerUserId}`), {
            tenantId: tenantRef.id, userId: ownerUserId, roles: ["owner"], status: "active", isDefault: true,
            joinedAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        batch.set(db.collection("users").doc(ownerUserId), {
            tenantId: tenantRef.id, activeTenantId: tenantRef.id, tenantIds: firestore_1.FieldValue.arrayUnion(tenantRef.id), updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    await batch.commit();
    await writePlatformAudit(actor, "tenant.created", tenantRef.id, `Created tenant ${name}.`, { type, ownerUserId });
    return { tenantId: tenantRef.id };
});
exports.updateTenantProfile = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const tenantId = requiredString(data.tenantId, "Tenant ID", 128);
    const ref = db.collection("tenants").doc(tenantId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new https_1.HttpsError("not-found", "Tenant not found.");
    const update = { updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid };
    for (const key of ["name", "country", "currency", "contactEmail", "contactPhone", "planId"])
        if (key in data)
            update[key] = optionalString(data[key], key === "name" ? 160 : 200);
    if (typeof update.name === "string" && update.name)
        update.slug = tenantSlug(update.name);
    if (typeof data.branding === "object" && data.branding)
        update.branding = data.branding;
    await ref.update(update);
    await writePlatformAudit(actor, "tenant.profile_updated", tenantId, "Updated tenant profile.", { fields: Object.keys(update) });
    return { tenantId };
});
exports.updateTenantStatus = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const tenantId = requiredString(data.tenantId, "Tenant ID", 128);
    const status = requiredString(data.status, "Status", 40);
    if (!TENANT_STATUSES.has(status))
        throw new https_1.HttpsError("invalid-argument", "Unsupported tenant status.");
    const ref = db.collection("tenants").doc(tenantId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new https_1.HttpsError("not-found", "Tenant not found.");
    if (snap.get("type") === "platform" || tenantId === "medical-elites-platform")
        throw new https_1.HttpsError("failed-precondition", "The protected platform tenant cannot be changed.");
    const previousStatus = String(snap.get("status") ?? "");
    const reason = optionalString(data.reason, 500);
    await ref.update({ status, suspensionReason: status === "suspended" ? reason ?? "Suspended by platform administrator" : null, suspendedAt: status === "suspended" ? firestore_1.FieldValue.serverTimestamp() : null, updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid });
    await writePlatformAudit(actor, "tenant.status_updated", tenantId, `Changed tenant status from ${previousStatus} to ${status}.`, { previousStatus, status, reason });
    return { tenantId, status };
});
exports.assignTenantOwner = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const tenantId = requiredString(data.tenantId, "Tenant ID", 128);
    const ownerUserId = requiredString(data.ownerUserId, "Owner user ID", 128);
    const tenantRef = db.collection("tenants").doc(tenantId);
    const userRef = db.collection("users").doc(ownerUserId);
    const [tenant, user] = await Promise.all([tenantRef.get(), userRef.get()]);
    if (!tenant.exists)
        throw new https_1.HttpsError("not-found", "Tenant not found.");
    if (!user.exists)
        throw new https_1.HttpsError("not-found", "Owner user profile not found.");
    const batch = db.batch();
    batch.update(tenantRef, { ownerUserId, updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid });
    batch.set(db.collection("tenantMemberships").doc(`${tenantId}_${ownerUserId}`), { tenantId, userId: ownerUserId, roles: ["owner"], status: "active", isDefault: true, joinedAt: firestore_1.FieldValue.serverTimestamp(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    batch.set(userRef, { tenantId, activeTenantId: tenantId, tenantIds: firestore_1.FieldValue.arrayUnion(tenantId), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit();
    await writePlatformAudit(actor, "tenant.owner_assigned", tenantId, "Assigned tenant owner.", { ownerUserId });
    return { tenantId, ownerUserId };
});
const PLAN_AUDIENCES = new Set(["institution", "tutor", "student"]);
const PLAN_STATUSES = new Set(["draft", "active", "retired"]);
const BILLING_INTERVALS = new Set(["monthly", "annual", "none"]);
const SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "cancelled", "expired", "suspended"]);
const PLAN_ENTITLEMENTS = new Set([
    "AI_QUESTION_GENERATION", "AI_LESSON_GENERATION", "PROFESSIONAL_EXAM_BUILDER",
    "MARKETPLACE_SELLING", "ERP_MODULES", "ADVANCED_ANALYTICS", "CERTIFICATE_ISSUANCE", "WHITE_LABEL",
]);
function validatedFiniteNumber(value, field, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(number) || number < minimum || number > maximum) {
        throw new https_1.HttpsError("invalid-argument", `${field} must be between ${minimum} and ${maximum}.`);
    }
    return Math.round(number);
}
function stringArray(value, allowed, field) {
    if (!Array.isArray(value))
        throw new https_1.HttpsError("invalid-argument", `${field} must be an array.`);
    const clean = [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
    if (clean.some((item) => !allowed.has(item)))
        throw new https_1.HttpsError("invalid-argument", `${field} contains an unsupported value.`);
    return clean;
}
exports.saveSubscriptionPlan = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const name = requiredString(data.name, "Plan name", 160);
    const code = requiredString(data.code, "Plan code", 80).toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "");
    const audience = requiredString(data.audience, "Audience", 40);
    const status = requiredString(data.status, "Status", 40);
    const billingInterval = requiredString(data.billingInterval, "Billing interval", 40);
    if (!PLAN_AUDIENCES.has(audience) || !PLAN_STATUSES.has(status) || !BILLING_INTERVALS.has(billingInterval)) {
        throw new https_1.HttpsError("invalid-argument", "Unsupported plan configuration.");
    }
    const limitsData = typeof data.limits === "object" && data.limits ? data.limits : {};
    const limits = {
        maxStudents: validatedFiniteNumber(limitsData.maxStudents, "Maximum students", 0, 1_000_000),
        maxTutors: validatedFiniteNumber(limitsData.maxTutors, "Maximum tutors", 0, 100_000),
        maxCourseUnits: validatedFiniteNumber(limitsData.maxCourseUnits, "Maximum course units", 0, 100_000),
        storageBytes: validatedFiniteNumber(limitsData.storageBytes, "Storage bytes", 0, 10 * 1024 ** 4),
        monthlyAiCredits: validatedFiniteNumber(limitsData.monthlyAiCredits, "Monthly AI credits", 0, 100_000_000),
    };
    const payload = {
        name, code, audience, status, billingInterval,
        priceMinor: validatedFiniteNumber(data.priceMinor, "Price", 0, 10_000_000_000),
        currency: requiredString(data.currency, "Currency", 10).toUpperCase(),
        commissionBasisPoints: validatedFiniteNumber(data.commissionBasisPoints, "Commission", 0, 10_000),
        enabledEntitlements: stringArray(data.enabledEntitlements, PLAN_ENTITLEMENTS, "Entitlements"),
        limits, trialDays: validatedFiniteNumber(data.trialDays ?? 0, "Trial days", 0, 365),
        description: optionalString(data.description, 1000), isActive: status === "active",
        updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid,
    };
    const requestedId = optionalString(data.planId, 128);
    const planRef = requestedId ? db.collection("plans").doc(requestedId) : db.collection("plans").doc(code);
    const duplicate = await db.collection("plans").where("code", "==", code).limit(2).get();
    if (duplicate.docs.some((item) => item.id !== planRef.id))
        throw new https_1.HttpsError("already-exists", "A plan with this code already exists.");
    await planRef.set({ ...payload, createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await db.collection("platformAuditLogs").add({ actorUid: actor.uid, actorName: actor.name, action: "plan.saved", entityType: "plan", entityId: planRef.id, summary: `Saved subscription plan ${name}.`, metadata: { code, audience, status }, createdAt: firestore_1.FieldValue.serverTimestamp() });
    return { planId: planRef.id };
});
function subscriptionPeriod(interval, trialDays) {
    const start = new Date();
    const end = new Date(start);
    if (trialDays > 0)
        end.setUTCDate(end.getUTCDate() + trialDays);
    else if (interval === "annual")
        end.setUTCFullYear(end.getUTCFullYear() + 1);
    else if (interval === "monthly")
        end.setUTCMonth(end.getUTCMonth() + 1);
    else
        end.setUTCFullYear(end.getUTCFullYear() + 100);
    return { start, end };
}
exports.assignTenantSubscription = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const tenantId = requiredString(data.tenantId, "Tenant ID", 128);
    const planId = requiredString(data.planId, "Plan ID", 128);
    const requestedStatus = optionalString(data.status, 40) ?? "trialing";
    if (!new Set(["trialing", "active"]).has(requestedStatus))
        throw new https_1.HttpsError("invalid-argument", "Subscription must start as trialing or active.");
    const [tenant, plan] = await Promise.all([db.collection("tenants").doc(tenantId).get(), db.collection("plans").doc(planId).get()]);
    if (!tenant.exists)
        throw new https_1.HttpsError("not-found", "Tenant not found.");
    if (!plan.exists || plan.get("status") !== "active")
        throw new https_1.HttpsError("failed-precondition", "Choose an active subscription plan.");
    const trialDays = requestedStatus === "trialing" ? validatedFiniteNumber(data.trialDays ?? plan.get("trialDays") ?? 0, "Trial days", 0, 365) : 0;
    const period = subscriptionPeriod(String(plan.get("billingInterval") ?? "monthly"), trialDays);
    const subscriptionId = tenantId;
    const batch = db.batch();
    const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
    batch.set(subscriptionRef, { tenantId, planId, status: requestedStatus, currentPeriodStart: period.start.toISOString(), currentPeriodEnd: period.end.toISOString(), trialEndsAt: trialDays > 0 ? period.end.toISOString() : null, cancelAtPeriodEnd: false, source: "manual", updatedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    batch.update(tenant.ref, { planId, subscriptionStatus: requestedStatus, trialEndsAt: trialDays > 0 ? period.end.toISOString() : null, status: requestedStatus === "trialing" ? "trial" : "active", updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid });
    batch.set(db.collection("licenseGrants").doc(subscriptionId), { tenantId, planId, status: requestedStatus === "trialing" ? "trial" : "active", source: requestedStatus === "trialing" ? "trial" : "manual", startsAt: period.start.toISOString(), endsAt: period.end.toISOString(), updatedAt: firestore_1.FieldValue.serverTimestamp(), createdAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit();
    await writePlatformAudit(actor, "subscription.assigned", tenantId, `Assigned plan ${planId}.`, { planId, status: requestedStatus, trialDays });
    return { subscriptionId, status: requestedStatus };
});
exports.updateTenantSubscriptionStatus = (0, https_1.onCall)({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false }, async (request) => {
    const actor = await assertPlatformSuperAdmin(request);
    const data = (request.data ?? {});
    const tenantId = requiredString(data.tenantId, "Tenant ID", 128);
    const status = requiredString(data.status, "Subscription status", 40);
    if (!SUBSCRIPTION_STATUSES.has(status) || status === "trialing")
        throw new https_1.HttpsError("invalid-argument", "Unsupported subscription status.");
    const subscriptionRef = db.collection("subscriptions").doc(tenantId);
    const tenantRef = db.collection("tenants").doc(tenantId);
    const [subscription, tenant] = await Promise.all([subscriptionRef.get(), tenantRef.get()]);
    if (!subscription.exists || !tenant.exists)
        throw new https_1.HttpsError("not-found", "Tenant subscription not found.");
    const tenantStatus = status === "active" ? "active" : status === "past_due" ? "past_due" : status === "suspended" ? "suspended" : "cancelled";
    const batch = db.batch();
    batch.update(subscriptionRef, { status, statusReason: optionalString(data.reason, 500), updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid });
    batch.update(tenantRef, { subscriptionStatus: status, status: tenantStatus, updatedAt: firestore_1.FieldValue.serverTimestamp(), updatedByUid: actor.uid });
    batch.set(db.collection("licenseGrants").doc(tenantId), { status: status === "active" ? "active" : "suspended", updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit();
    await writePlatformAudit(actor, "subscription.status_updated", tenantId, `Changed subscription status to ${status}.`, { status, reason: optionalString(data.reason, 500) });
    return { subscriptionId: tenantId, status };
});
//# sourceMappingURL=index.js.map