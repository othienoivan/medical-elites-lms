import type { ReactNode } from "react";
import type { EntitlementKey } from "../models/Plan";
import useTenant from "../hooks/useTenant";
import { hasEntitlement } from "../utils/entitlements";

type Props = { entitlement: EntitlementKey; children: ReactNode; fallback?: ReactNode };

export default function EntitlementGate({ entitlement, children, fallback = null }: Props) {
  const { activePlan, loading } = useTenant();
  if (loading) return null;
  return hasEntitlement(activePlan, entitlement) ? <>{children}</> : <>{fallback}</>;
}
