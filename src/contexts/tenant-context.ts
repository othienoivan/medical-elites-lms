import { createContext } from "react";
import type { Plan, TenantSubscription } from "../models/Plan";
import type { Tenant, TenantMembership } from "../models/Tenant";

export type TenantContextValue = {
  memberships: TenantMembership[];
  activeMembership: TenantMembership | null;
  activeTenant: Tenant | null;
  activePlan: Plan | null;
  activeSubscription: TenantSubscription | null;
  loading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
};

export const TenantContext = createContext<TenantContextValue>({
  memberships: [],
  activeMembership: null,
  activeTenant: null,
  activePlan: null,
  activeSubscription: null,
  loading: true,
  error: null,
  switchTenant: async () => undefined,
  refreshTenant: async () => undefined,
});
