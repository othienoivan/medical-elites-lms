import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import useAuth from "../hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}