import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { db, functions } from "../config/firebase";
import type { Plan, TenantSubscription } from "../models/Plan";
import type { Tenant, TenantMembership } from "../models/Tenant";

function mapTenant(id: string, data: Record<string, unknown>): Tenant {
  return { ...(data as Omit<Tenant, "id">), id };
}

function mapMembership(id: string, data: Record<string, unknown>): TenantMembership {
  return { ...(data as Omit<TenantMembership, "id">), id };
}

function cleanId(value: string): string {
  return value.trim();
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const id = cleanId(tenantId);
  if (!id) return null;
  try {
    const snapshot = await getDoc(doc(db, "tenants", id));
    return snapshot.exists()
      ? mapTenant(snapshot.id, snapshot.data() as Record<string, unknown>)
      : null;
  } catch (error) {
    // Legacy tenant memberships may not use the deterministic membership ID
    // required by the current Firestore tenant-read rule. Treat this as an
    // unsynchronised workspace so TenantProvider can repair it through the
    // trusted bootstrap callable instead of failing the whole application.
    const code = String((error as { code?: unknown })?.code ?? "");
    if (code.includes("permission-denied")) return null;
    throw error;
  }
}

export async function getUserTenantMemberships(userId: string): Promise<TenantMembership[]> {
  const uid = cleanId(userId);
  if (!uid) return [];

  try {
    const snapshot = await getDocs(
      query(
        collection(db, "tenantMemberships"),
        where("userId", "==", uid),
        where("status", "==", "active"),
      ),
    );

    return snapshot.docs
      .map((item) => mapMembership(item.id, item.data() as Record<string, unknown>))
      .filter((membership) => membership.tenantId.trim().length > 0)
      .sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)));
  } catch (error) {
    const code = String((error as { code?: unknown })?.code ?? "");
    if (code.includes("permission-denied")) return [];
    throw error;
  }
}

export async function getPlan(planId: string): Promise<Plan | null> {
  const id = cleanId(planId);
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "plans", id));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Omit<Plan, "id">;
  return {
    id: snapshot.id,
    ...data,
    // Older plans may have status=active without an explicit isActive field.
    // Treat either representation as active so a valid paid plan never falls
    // through to the Free Tutor compatibility plan.
    isActive: data.isActive === true || data.status === "active",
  } as Plan;
}


export async function getTenantSubscriptions(tenantId: string): Promise<TenantSubscription[]> {
  const id = cleanId(tenantId);
  if (!id) return [];

  // Phase 3 subscriptions are canonical:
  // subscriptions/{tenantId}
  //
  // Prefer the canonical document instead of querying the whole collection.
  // This keeps the client aligned with the server subscription architecture
  // and avoids unnecessary Firestore query authorization/index complexity.
  const canonical = await getDoc(doc(db, "subscriptions", id));

  if (canonical.exists()) {
    return [{
      id: canonical.id,
      ...(canonical.data() as Omit<TenantSubscription, "id">),
    } as TenantSubscription];
  }

  // Legacy compatibility for subscriptions created before canonicalization.
  const snapshot = await getDocs(
    query(collection(db, "subscriptions"), where("tenantId", "==", id)),
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<TenantSubscription, "id">),
  } as TenantSubscription));
}

function preferredSubscription(items: TenantSubscription[]): TenantSubscription | null {
  return items.find((item) => item.status === "active")
    ?? items.find((item) => item.status === "trialing")
    ?? items[0]
    ?? null;
}

export type TenantWorkspaceResolution = {
  memberships: TenantMembership[];
  selected: TenantMembership | null;
  tenant: Tenant | null;
  plan: Plan | null;
  subscription: TenantSubscription | null;
};


async function resolveTenantWorkspaceTrusted(
  preferredTenantId?: string | null,
): Promise<TenantWorkspaceResolution> {
  const callable = httpsCallable<
    { preferredTenantId?: string | null },
    TenantWorkspaceResolution
  >(functions, "resolveTenantWorkspaceTrusted");
  const result = await callable({ preferredTenantId: preferredTenantId?.trim() || null });
  return result.data;
}

export async function resolveTenantWorkspace(
  userId: string,
  preferredTenantId?: string | null,
): Promise<TenantWorkspaceResolution> {
  try {
    const memberships = await getUserTenantMemberships(userId);
    const preferred = preferredTenantId?.trim() || null;
    const selected =
      memberships.find((membership) => membership.tenantId === preferred)
      ?? memberships.find((membership) => membership.isDefault)
      ?? memberships[0]
      ?? null;

    const tenant = selected ? await getTenant(selected.tenantId) : null;
    if (selected && !tenant) {
      return resolveTenantWorkspaceTrusted(preferredTenantId);
    }

    const subscriptions = tenant
      ? await getTenantSubscriptions(tenant.id)
      : [];

    const subscription = preferredSubscription(subscriptions);
    const subscriptionPlanId =
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing")
        ? subscription.planId
        : null;

    const effectivePlanId = subscriptionPlanId || tenant?.planId || null;
    const plan = effectivePlanId
      ? await getPlan(effectivePlanId)
      : null;

    return { memberships, selected, tenant, plan, subscription };
  } catch (error) {
    const code = String((error as { code?: unknown })?.code ?? "");
    if (code.includes("permission-denied") || code.includes("failed-precondition")) {
      return resolveTenantWorkspaceTrusted(preferredTenantId);
    }
    throw error;
  }
}

export type TenantBootstrapResult = {
  tenantId: string;
  membershipId: string;
  createdTenant: boolean;
  createdMembership: boolean;
};

export async function bootstrapTenantWorkspace(): Promise<TenantBootstrapResult> {
  const callable = httpsCallable<Record<string, never>, TenantBootstrapResult>(
    functions,
    "bootstrapTenantWorkspace",
  );
  const result = await callable({});
  return result.data;
}

