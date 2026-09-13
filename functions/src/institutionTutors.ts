import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function resolveInstitutionAdminWorkspace(uid: string): Promise<string> {
  const db = getFirestore();
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists || clean(user.get("role")) !== "admin" || user.get("isActive") === false) {
    throw new HttpsError("permission-denied", "An active institution administrator account is required.");
  }
  const tenantId = clean(user.get("activeTenantId") ?? user.get("tenantId") ?? user.get("institutionId"));
  if (!tenantId || tenantId.startsWith("tutor_")) {
    throw new HttpsError("failed-precondition", "No institution workspace is assigned to this administrator.");
  }
  const membership = await db.collection("tenantMemberships").doc(`${tenantId}_${uid}`).get();
  const roles = membership.exists && Array.isArray(membership.get("roles")) ? membership.get("roles") as unknown[] : [];
  const membershipAllows = membership.exists
    && membership.get("status") === "active"
    && roles.some((role) => ["owner", "institution_admin"].includes(String(role)));
  const legacyAllows = clean(user.get("institutionId")) === tenantId;
  if (!membershipAllows && !legacyAllows) {
    throw new HttpsError("permission-denied", "You are not allowed to manage tutors for this institution.");
  }
  return tenantId;
}

export const getInstitutionTutorMemberships = onCall(
  { region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
    const db = getFirestore();
    const tenantId = await resolveInstitutionAdminWorkspace(request.auth.uid);
    const membershipSnapshot = await db.collection("tenantMemberships").where("tenantId", "==", tenantId).get();
    const memberships = membershipSnapshot.docs.filter((item) => {
      const roles = Array.isArray(item.get("roles")) ? item.get("roles") as unknown[] : [];
      return roles.some((role) => String(role) === "tutor");
    });
    const refs = memberships.map((item) => db.collection("users").doc(clean(item.get("userId")))).filter((ref) => Boolean(ref.id));
    const userSnapshots = refs.length ? await db.getAll(...refs) : [];
    const users = new Map(userSnapshots.map((item) => [item.id, item]));
    const items = memberships.flatMap((membership) => {
      const tutorUid = clean(membership.get("userId"));
      const user = users.get(tutorUid);
      if (!tutorUid || !user?.exists || clean(user.get("role")) !== "tutor") return [];
      const currentTenantId = clean(user.get("tenantId"));
      const independent = clean(user.get("workspaceMode")) === "independent" || currentTenantId === `tutor_${tutorUid}`;
      return [{
        membershipId: membership.id,
        tenantId,
        tutorUid,
        fullName: clean(user.get("fullName")) || clean(user.get("displayName")) || "Tutor",
        email: clean(user.get("email")),
        status: clean(membership.get("status")) || "inactive",
        independent,
      }];
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
    return { tenantId, items };
  },
);

export const setInstitutionTutorAccess = onCall(
  { region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
    const tutorUid = clean((request.data as { tutorUid?: unknown } | undefined)?.tutorUid);
    const status = clean((request.data as { status?: unknown } | undefined)?.status);
    if (!tutorUid || !["active", "inactive"].includes(status)) throw new HttpsError("invalid-argument", "Tutor and status are required.");
    const db = getFirestore();
    const tenantId = await resolveInstitutionAdminWorkspace(request.auth.uid);
    const snap = await db.collection("tenantMemberships").where("tenantId", "==", tenantId).where("userId", "==", tutorUid).get();
    const memberships = snap.docs.filter((item) => Array.isArray(item.get("roles")) && (item.get("roles") as unknown[]).some((role) => String(role) === "tutor"));
    if (!memberships.length) throw new HttpsError("not-found", "Institution tutor membership was not found.");
    const batch = db.batch();
    memberships.forEach((item) => batch.set(item.ref, { status, updatedAt: FieldValue.serverTimestamp(), updatedBy: request.auth!.uid }, { merge: true }));
    await batch.commit();
    return { tutorUid, tenantId, status };
  },
);

export const removeTutorFromInstitution = onCall(
  { region: "us-central1", timeoutSeconds: 60, memory: "256MiB", enforceAppCheck: false },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
    const tutorUid = clean((request.data as { tutorUid?: unknown } | undefined)?.tutorUid);
    if (!tutorUid) throw new HttpsError("invalid-argument", "Tutor is required.");
    const db = getFirestore();
    const tenantId = await resolveInstitutionAdminWorkspace(request.auth.uid);
    const tutorRef = db.collection("users").doc(tutorUid);
    const tutor = await tutorRef.get();
    if (!tutor.exists || clean(tutor.get("role")) !== "tutor") throw new HttpsError("not-found", "Tutor account was not found.");
    const snap = await db.collection("tenantMemberships").where("tenantId", "==", tenantId).where("userId", "==", tutorUid).get();
    const memberships = snap.docs.filter((item) => Array.isArray(item.get("roles")) && (item.get("roles") as unknown[]).some((role) => String(role) === "tutor"));
    if (!memberships.length) throw new HttpsError("not-found", "Institution tutor membership was not found.");

    const independentTenantId = `tutor_${tutorUid}`;
    const priorTenantIds = Array.isArray(tutor.get("tenantIds")) ? (tutor.get("tenantIds") as unknown[]).map(String) : [];
    const tenantIds = Array.from(new Set([...priorTenantIds.filter((id) => id !== tenantId), independentTenantId]));
    const batch = db.batch();
    memberships.forEach((item) => batch.set(item.ref, {
      status: "removed", removedAt: FieldValue.serverTimestamp(), removedBy: request.auth!.uid, updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }));
    batch.set(db.collection("tenants").doc(independentTenantId), {
      type: "independent_tutor",
      name: `${clean(tutor.get("fullName")) || "Tutor"} workspace`,
      slug: independentTenantId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      status: "active", ownerUserId: tutorUid, planId: "tutor_free", legacyInstitutionId: null,
      updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.set(db.collection("tenantMemberships").doc(`${independentTenantId}_${tutorUid}`), {
      tenantId: independentTenantId, userId: tutorUid, roles: ["owner", "tutor"], status: "active", isDefault: true,
      joinedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.set(tutorRef, {
      workspaceMode: "independent", tenantId: independentTenantId, activeTenantId: independentTenantId, tenantIds,
      institutionId: FieldValue.delete(), institutionName: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return { tutorUid, removedFromTenantId: tenantId, independentTenantId, accountPreserved: true };
  },
);
