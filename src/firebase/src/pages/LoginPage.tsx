import { ShieldCheck, Stethoscope, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { loginUser, logoutUser } from "../firebase/auth";
import useAuth from "../hooks/useAuth";
import type { UserRole } from "../models/User";
import { getFirebaseErrorMessage } from "../utils/firebaseErrorMessage";

type PortalRole = UserRole;

const portals: { role: PortalRole; title: string; description: string; icon: React.ElementType }[] = [
  { role: "student", title: "Student", description: "Learning, assessments, attendance, finance, and AI support.", icon: Stethoscope },
  { role: "tutor", title: "Tutor", description: "Teaching, assessment, marking, analytics, and supervision.", icon: ShieldCheck },
  { role: "admin", title: "Administrator", description: "Institutional oversight, users, finance, and system management.", icon: UserCog },
];

function isPortalRole(value: string | null): value is PortalRole {
  return value === "student" || value === "tutor" || value === "admin";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialRole = isPortalRole(searchParams.get("role")) ? searchParams.get("role") as PortalRole : "student";
  const [selectedRole, setSelectedRole] = useState<PortalRole>(initialRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    searchParams.get("status") === "pending"
      ? "Your tutor registration request was submitted and is awaiting administrator approval."
      : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function finishLogin() {
      if (authLoading || !currentUser || !userProfile) return;

      if (
        selectedRole === "tutor" &&
        userProfile.requestedRole === "tutor" &&
        userProfile.role === "student" &&
        !userProfile.isActive
      ) {
        await logoutUser();
        setError("Your tutor registration request is still awaiting administrator approval.");
        return;
      }

      if (!userProfile.isActive) {
        await logoutUser();
        setError("This account is awaiting activation by an administrator.");
        return;
      }

      if (userProfile.role !== selectedRole) {
        await logoutUser();
        setError(`This account is registered as ${userProfile.role}, not ${selectedRole}. Please choose the correct portal.`);
        return;
      }

      sessionStorage.removeItem("redirectAfterLogin");
      const roleDestination =
        userProfile.role === "student"
          ? "/dashboard"
          : userProfile.role === "admin"
            ? "/admin"
            : "/tutor";
      const destination = searchParams.get("redirect") || roleDestination;
      navigate(destination, { replace: true });
    }

    void finishLogin();
  }, [authLoading, currentUser, navigate, searchParams, selectedRole, userProfile]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      await loginUser(email.trim(), password);
    } catch (caughtError: unknown) {
      console.error("LOGIN ERROR:", caughtError);
      setError(getFirebaseErrorMessage(caughtError, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="bg-slate-100 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="flex justify-center"><Logo /></div>
            <h1 className="mt-6 text-4xl font-extrabold text-slate-950">Choose your login portal</h1>
            <p className="mt-3 text-slate-600">Select the role assigned to your account before signing in.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {portals.map(({ role, title, description, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => { setSelectedRole(role); setError(""); }}
                className={`rounded-2xl border p-5 text-left transition ${selectedRole === role ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}
              >
                <Icon className="text-blue-700" size={28} />
                <p className="mt-4 text-lg font-bold text-slate-950">{title} Portal</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </button>
            ))}
          </div>

          <Card className="mx-auto mt-8 w-full max-w-md">
            <h2 className="text-center text-2xl font-bold text-slate-950">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login</h2>
            {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <label className="block"><span className="mb-2 block font-medium text-slate-700">Email Address</span><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
              <label className="block"><span className="mb-2 block font-medium text-slate-700">Password</span><Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in..." : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}</Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account? <Link to={`/register?role=${selectedRole}`} className="font-semibold text-blue-700 hover:underline">Register or request access</Link>
            </p>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
