import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import type { UserRole } from "../models/User";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: readonly UserRole[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { currentUser, userProfile, role, loading, profileError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <p className="text-slate-600">Checking account access...</p>
      </div>
    );
  }

  if (!currentUser) {
    const redirectPath = location.pathname + location.search;
    sessionStorage.setItem("redirectAfterLogin", redirectPath);

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
      />
    );
  }

  if (profileError || !userProfile || !role) {
    return <Navigate to="/unauthorized?reason=profile" replace />;
  }

  if (!userProfile.isActive) {
    return <Navigate to="/unauthorized?reason=inactive" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized?reason=role" replace />;
  }

  return <>{children}</>;
}
