import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Plan } from "../models/Plan";
import type { Tenant, TenantMembership, TenantRole } from "../models/Tenant";
import {
  bootstrapTenantWorkspace,
  resolveTenantWorkspace,
} from "../firebase/tenants";
import useAuth from "../hooks/useAuth";
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
} {
  if (!institutionId && role !== "tutor") {
    return { memberships: [], selected: null, tenant: null, plan: null };
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

  return { memberships: [membership], selected: membership, tenant, plan: null };
}

export default function TenantProvider({ children }: TenantProviderProps) {
  const { currentUser, userProfile, role, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [activeMembership, setActiveMembership] = useState<TenantMembership | null>(null);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async (preferredTenantId?: string | null) => {
    if (!currentUser || !role) {
      setMemberships([]);
      setActiveMembership(null);
      setActiveTenant(null);
      setActivePlan(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let workspace = await resolveTenantWorkspace(currentUser.uid, preferredTenantId);

      if (workspace.memberships.length === 0) {
        try {
          await bootstrapTenantWorkspace();
          workspace = await resolveTenantWorkspace(currentUser.uid, preferredTenantId);
        } catch (bootstrapError) {
          console.warn("Tenant bootstrap was unavailable; using the legacy workspace compatibility layer.", bootstrapError);
        }
      }

      if (workspace.memberships.length === 0) {
        workspace = legacyWorkspace(
          currentUser.uid,
          role,
          userProfile?.institutionId,
          userProfile?.institutionName,
        );
      }

      setMemberships(workspace.memberships);
      setActiveMembership(workspace.selected);
      setActiveTenant(workspace.tenant);
      setActivePlan(workspace.plan);

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
      setMemberships(fallback.memberships);
      setActiveMembership(fallback.selected);
      setActiveTenant(fallback.tenant);
      setActivePlan(fallback.plan);
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
    loading: authLoading || loading,
    error,
    switchTenant,
    refreshTenant: async () => loadWorkspace(activeTenant?.id ?? null),
  }), [
    activeMembership,
    activePlan,
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
