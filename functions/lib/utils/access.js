"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUserAccess = resolveUserAccess;
exports.enforceModeAccess = enforceModeAccess;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
async function resolveUserAccess(request) {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Sign in to use the AI assistant.");
    }
    const profile = await (0, firestore_1.getFirestore)()
        .collection("users")
        .doc(request.auth.uid)
        .get();
    const rawRole = String(profile.data()?.role ?? "student");
    const role = rawRole === "admin" || rawRole === "tutor" ? rawRole : "student";
    return {
        uid: request.auth.uid,
        email: String(request.auth.token.email ?? ""),
        role,
    };
}
function enforceModeAccess(mode, role) {
    if (mode.startsWith("tutor_") && role !== "tutor" && role !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Tutor AI tools require a tutor or administrator account.");
    }
}
//# sourceMappingURL=access.js.map