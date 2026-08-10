import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Plan, TenantSubscription } from "../models/Plan";
import { effectivePlan } from "../models/defaultPlans";
import type { Tenant, TenantMembership, TenantRole } from "../models/Tenant";
import {
  bootstrapTenantWorkspace,
  getPlan,
  resolveTenantWorkspace,
} from "../firebase/tenants";
import useAuth from "../hooks/useAuth";
import { refreshTutorSubscriptionLifecycle } from "../domains/finance/infrastructure/commerceRepository";
import { TenantContext, type TenantContextValue } from "../contexts/tenant-context";

const STORAGE_PREFIX = "medical-elites.active-tenant";

type TenantProviderProps = {
  children: ReactNode;
};

function preferredTenantKey(uid: string): string {
  return `${STORAGE_PREFIX}.${uid}`;
}

function membershipRoleForUser(role: "student" | "tutor" | "admin"): TenantRole {
  if (role === "admin") return "institution_admin";
  return role;
}

function planAudienceForRole(role: "student" | "tutor" | "admin"): "student" | "tutor" | "institution" {
  return role === "admin" ? "institution" : role;
}

type TutorLifecycleSnapshot = {
  tenantId: string;
  status: string;
  planId: string;
  changed: boolean;
  currentPeriodEnd?: unknown;
};

function isPaidTutorLifecycle(snapshot: TutorLifecycleSnapshot | null | undefined): boolean {
  return Boolean(
    snapshot
      && (snapshot.status === "active" || snapshot.status === "trialing")
      && snapshot.planId
      && snapshot.planId !== "tutor_free"
  );
}

function lifecycleSubscription(snapshot: TutorLifecycleSnapshot): TenantSubscription {
  return {
    id: snapshot.tenantId,
    tenantId: snapshot.tenantId,
    planId: snapshot.planId,
    status: snapshot.status as TenantSubscription["status"],
    currentPeriodEnd: (snapshot.currentPeriodEnd ?? null) as TenantSubscription["currentPeriodEnd"],
    source: "trusted_lifecycle_recovery",
  };
}

function legacyWorkspace(
  uid: string,
  role: "student" | "tutor" | "admin",
  institutionId?: string,
  institutionName?: string,
): {
  memberships: TenantMembership[];
  selected: TenantMembership | null;
  tenant: Tenant | null;
  plan: Plan | null;
  subscription: TenantSubscription | null;
} {
  if (!institutionId && role !== "tutor") {
    return { memberships: [], selected: null, tenant: null, plan: null, subscription: null };
  }

  const tenantId = institutionId ?? `tutor_${uid}`;
  const type = institutionId ? "institution" : "independent_tutor";
  const membership: TenantMembership = {
    id: `${tenantId}_${uid}`,
    tenantId,
    userId: uid,
    roles: [institutionId ? membershipRoleForUser(role) : "owner"],
    status: "active",
    isDefault: true,
  };
  const tenant: Tenant = {
    id: tenantId,
    type,
    name: institutionName?.trim() || (institutionId ? "Institution workspace" : "My tutor workspace"),
    slug: tenantId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    status: "active",
    ownerUserId: institutionId && role !== "admin" ? "" : uid,
    planId: institutionId ? "institution_free" : "tutor_free",
    legacyInstitutionId: institutionId,
  };

  return { memberships: [membership], selected: membership, tenant, plan: null, subscription: null };
}

export default function TenantProvider({ children }: TenantProviderProps) {
  const { currentUser, userProfile, role, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [activeMembership, setActiveMembership] = useState<TenantMembership | null>(null);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<TenantSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async (preferredTenantId?: string | null) => {
    if (!currentUser || !role) {
      setMemberships([]);
      setActiveMembership(null);
      setActiveTenant(null);
      setActivePlan(null);
      setActiveSubscription(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let workspace = await resolveTenantWorkspace(currentUser.uid, preferredTenantId);
      const canBootstrapWorkspace = role === "tutor" || Boolean(userProfile?.institutionId);

      // A legacy membership may be queryable while its tenant document is not
      // readable under the deterministic v3 membership rule. Repair both the
      // missing-membership and missing-tenant cases through the trusted server.
      // Students without an institution intentionally remain in the legacy/
      // marketplace learner context and should not receive a 400 bootstrap call.
      if (canBootstrapWorkspace && (workspace.memberships.length === 0 || !workspace.tenant)) {
        try {
          await bootstrapTenantWorkspace();
          workspace = await resolveTenantWorkspace(currentUser.uid, preferredTenantId);
        } catch (bootstrapError) {
          console.warn("Tenant workspace synchronization was unavailable; using compatibility access.", bootstrapError);
        }
      }

      if (workspace.memberships.length === 0 || !workspace.tenant) {
        workspace = legacyWorkspace(
          currentUser.uid,
          role,
          userProfile?.institutionId,
          userProfile?.institutionName,
        );
      }

      let resolvedPlan = workspace.plan;
      let resolvedSubscription = workspace.subscription;
      let resolvedTenant = workspace.tenant;

      // For tutors, the trusted subscription lifecycle is authoritative for paid access.
      // This deliberately overrides the hard-coded Free Tutor compatibility snapshot
      // whenever an active/trialing paid subscription exists.
      if (role === "tutor") {
        try {
          const lifecycle = await refreshTutorSubscriptionLifecycle();
          if (isPaidTutorLifecycle(lifecycle)) {
            const paidPlan = await getPlan(lifecycle.planId);
            if (paidPlan) {
              resolvedPlan = paidPlan;
              resolvedSubscription = lifecycleSubscription(lifecycle);
              if (!resolvedTenant || resolvedTenant.id !== lifecycle.tenantId) {
                resolvedTenant = workspace.tenant
                  ? { ...workspace.tenant, id: lifecycle.tenantId, planId: lifecycle.planId }
                  : legacyWorkspace(
                      currentUser.uid,
                      role,
                      userProfile?.institutionId,
                      userProfile?.institutionName,
                    ).tenant;
                if (resolvedTenant) {
                  resolvedTenant = { ...resolvedTenant, id: lifecycle.tenantId, planId: lifecycle.planId };
                }
              } else {
                resolvedTenant = { ...resolvedTenant, planId: lifecycle.planId };
              }
            }
          }
        } catch (lifecycleError) {
          console.warn("Trusted tutor subscription recovery was unavailable; using workspace plan resolution.", lifecycleError);
        }
      }

      setMemberships(workspace.memberships);
      setActiveMembership(workspace.selected);
      setActiveTenant(resolvedTenant);
      setActiveSubscription(resolvedSubscription);

      const subscriptionAllowsPaidPlan = !resolvedSubscription
        || resolvedSubscription.status === "active"
        || resolvedSubscription.status === "trialing";
      setActivePlan(
        role === "tutor" && !subscriptionAllowsPaidPlan
          ? effectivePlan(null, "tutor")
          : effectivePlan(resolvedPlan, planAudienceForRole(role)),
      );

      if (workspace.tenant) {
        localStorage.setItem(preferredTenantKey(currentUser.uid), workspace.tenant.id);
      }
    } catch (workspaceError) {
      console.error("Failed to resolve the active tenant workspace:", workspaceError);
      const fallback = legacyWorkspace(
        currentUser.uid,
        role,
        userProfile?.institutionId,
        userProfile?.institutionName,
      );

      // A workspace read failure must not erase a verified paid tutor subscription.
      // Recover the paid plan through the trusted callable, then use Free Tutor only
      // when there truly is no active/trialing paid subscription.
      if (role === "tutor") {
        try {
          const lifecycle = await refreshTutorSubscriptionLifecycle();
          if (isPaidTutorLifecycle(lifecycle)) {
            const paidPlan = await getPlan(lifecycle.planId);
            if (paidPlan) {
              const recoveredTenant = fallback.tenant
                ? { ...fallback.tenant, id: lifecycle.tenantId, planId: lifecycle.planId }
                : null;
              setMemberships(fallback.memberships);
              setActiveMembership(fallback.selected);
              setActiveTenant(recoveredTenant);
              setActiveSubscription(lifecycleSubscription(lifecycle));
              setActivePlan(effectivePlan(paidPlan, "tutor"));
              setError("Your workspace metadata could not be fully synchronized, but your verified paid tutor subscription remains active.");
              return;
            }
          }
        } catch (lifecycleError) {
          console.warn("Paid tutor subscription recovery failed after workspace resolution error.", lifecycleError);
        }
      }

      setMemberships(fallback.memberships);
      setActiveMembership(fallback.selected);
      setActiveTenant(fallback.tenant);
      setActiveSubscription(null);
      setActivePlan(effectivePlan(fallback.plan, planAudienceForRole(role)));
      setError("Your workspace could not be fully synchronized. Legacy institution access remains available.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, role, userProfile?.institutionId, userProfile?.institutionName]);

  useEffect(() => {
    if (authLoading) return;
    const preferredTenantId = currentUser
      ? localStorage.getItem(preferredTenantKey(currentUser.uid))
      : null;
    void loadWorkspace(preferredTenantId);
  }, [authLoading, currentUser, loadWorkspace]);

  const switchTenant = useCallback(async (tenantId: string) => {
    const membership = memberships.find(
      (item) => item.tenantId === tenantId && item.status === "active",
    );
    if (!membership) {
      throw new Error("You do not have active access to that workspace.");
    }
    await loadWorkspace(tenantId);
  }, [loadWorkspace, memberships]);

  const value = useMemo<TenantContextValue>(() => ({
    memberships,
    activeMembership,
    activeTenant,
    activePlan,
    activeSubscription,
    loading: authLoading || loading,
    error,
    switchTenant,
    refreshTenant: async () => loadWorkspace(activeTenant?.id ?? null),
  }), [
    activeMembership,
    activePlan,
    activeSubscription,
    activeTenant,
    authLoading,
    error,
    loadWorkspace,
    loading,
    memberships,
    switchTenant,
  ]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
