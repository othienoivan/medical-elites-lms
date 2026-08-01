import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Plan } from "../models/Plan";
import type { Tenant, TenantMembership } from "../models/Tenant";

function mapTenant(id: string, data: Record<string, unknown>): Tenant {
  return { ...(data as Omit<Tenant, "id">), id };
}

function mapMembership(id: string, data: Record<string, unknown>): TenantMembership {
  return { ...(data as Omit<TenantMembership, "id">), id };
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const snapshot = await getDoc(doc(db, "tenants", tenantId));
  return snapshot.exists()
    ? mapTenant(snapshot.id, snapshot.data() as Record<string, unknown>)
    : null;
}

export async function getUserTenantMemberships(userId: string): Promise<TenantMembership[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "tenantMemberships"),
      where("userId", "==", userId),
      where("status", "==", "active"),
    ),
  );

  return snapshot.docs
    .map((item) => mapMembership(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)));
}

export async function getPlan(planId: string): Promise<Plan | null> {
  const snapshot = await getDoc(doc(db, "plans", planId));
  return snapshot.exists()
    ? ({ id: snapshot.id, ...(snapshot.data() as Omit<Plan, "id">) } as Plan)
    : null;
}

export async function resolveTenantWorkspace(userId: string, preferredTenantId?: string | null) {
  const memberships = await getUserTenantMemberships(userId);
  const selected =
    memberships.find((membership) => membership.tenantId === preferredTenantId)
    ?? memberships.find((membership) => membership.isDefault)
    ?? memberships[0]
    ?? null;

  const tenant = selected ? await getTenant(selected.tenantId) : null;
  const plan = tenant?.planId ? await getPlan(tenant.planId) : null;

  return { memberships, selected, tenant, plan };
}
