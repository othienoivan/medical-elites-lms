import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const bootstrapEmails = new Set(
  String(import.meta.env.VITE_PLATFORM_SUPER_ADMIN_EMAILS ?? "admin@medicalelites.org")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function hasPlatformAccess(profile: { role?: string; email?: string; platformRole?: string } | null | undefined): boolean {
  if (!profile || profile.role !== "admin") return false;
  const platformRole = String(profile.platformRole ?? "");
  const allowedPlatformRoles = new Set(["super_admin", "platform_admin", "platform_support", "platform_finance"]);
  return allowedPlatformRoles.has(platformRole) || bootstrapEmails.has(String(profile.email ?? "").toLowerCase());
}

export default function PlatformAccessGate({ children }: { children: ReactNode }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Checking platform access...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!hasPlatformAccess(userProfile)) return <Navigate to="/unauthorized?reason=platform" replace />;
  return <>{children}</>;
}
