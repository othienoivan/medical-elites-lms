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
import type { Plan } from "../models/Plan";
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
  const snapshot = await getDoc(doc(db, "tenants", id));
  return snapshot.exists()
    ? mapTenant(snapshot.id, snapshot.data() as Record<string, unknown>)
    : null;
}

export async function getUserTenantMemberships(userId: string): Promise<TenantMembership[]> {
  const uid = cleanId(userId);
  if (!uid) return [];

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
}

export async function getPlan(planId: string): Promise<Plan | null> {
  const id = cleanId(planId);
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "plans", id));
  return snapshot.exists()
    ? ({ id: snapshot.id, ...(snapshot.data() as Omit<Plan, "id">) } as Plan)
    : null;
}

export type TenantWorkspaceResolution = {
  memberships: TenantMembership[];
  selected: TenantMembership | null;
  tenant: Tenant | null;
  plan: Plan | null;
};

export async function resolveTenantWorkspace(
  userId: string,
  preferredTenantId?: string | null,
): Promise<TenantWorkspaceResolution> {
  const memberships = await getUserTenantMemberships(userId);
  const preferred = preferredTenantId?.trim() || null;
  const selected =
    memberships.find((membership) => membership.tenantId === preferred)
    ?? memberships.find((membership) => membership.isDefault)
    ?? memberships[0]
    ?? null;

  const tenant = selected ? await getTenant(selected.tenantId) : null;
  const plan = tenant?.planId ? await getPlan(tenant.planId) : null;

  return { memberships, selected, tenant, plan };
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
