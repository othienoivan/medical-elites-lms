import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import StudentLayout from "./StudentLayout";

const PUBLIC_PREFIXES = ["/", "/login", "/register", "/about", "/privacy", "/terms", "/testimonials", "/contact", "/unauthorized"];
const NON_STUDENT_PREFIXES = ["/tutor", "/admin", "/founder"];

export default function StudentWorkspaceGate({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PREFIXES.includes(pathname);
  const isNonStudent = NON_STUDENT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isFocusedAssessment = /^\/assessments\/quizzes\/[^/]+\/take$/.test(pathname);

  if (role !== "student" || isPublic || isNonStudent || isFocusedAssessment) return children;
  return <StudentLayout>{children}</StudentLayout>;
}
