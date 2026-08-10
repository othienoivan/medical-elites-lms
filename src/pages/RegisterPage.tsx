import { FirebaseError } from "firebase/app";
import { ShieldCheck, Stethoscope, UserCog } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { logoutUser, registerUser } from "../firebase/auth";
import { createUserProfile } from "../firebase/firestore";
import { claimRegistrationLink } from "../firebase/registrationLinks";
import { bootstrapTenantWorkspace } from "../firebase/tenants";

type RegistrationRole = "student" | "tutor" | "admin";

const roles: { role: RegistrationRole; title: string; description: string; icon: React.ElementType }[] = [
  { role: "student", title: "Student", description: "Create an active learner account and link it to your institutional student record.", icon: Stethoscope },
  { role: "tutor", title: "Tutor", description: "Create an active tutor account for the current testing phase.", icon: ShieldCheck },
  { role: "admin", title: "Administrator", description: "Administrator accounts are invitation-only for institutional security.", icon: UserCog },
];

function isRegistrationRole(value: string | null): value is RegistrationRole {
  return value === "student" || value === "tutor" || value === "admin";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialRole = isRegistrationRole(query.get("role")) ? query.get("role") as RegistrationRole : "student";
  const joinCode = query.get("join") || "";

  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedRole === "admin") {
      navigate("/contact?subject=admin-access");
      return;
    }
    if (!fullName.trim()) return setError("Full name is required.");
    if (!email.trim()) return setError("Email address is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      const firebaseUser = await registerUser(email.trim(), password);
      const publicTutorRegistration =
        import.meta.env.VITE_ALLOW_PUBLIC_TUTOR_REGISTRATION !== "false";
      const registeringTutor = selectedRole === "tutor";
      const tutorNeedsApproval = registeringTutor && !publicTutorRegistration;

      const createdRole = registeringTutor && publicTutorRegistration ? "tutor" : "student";
      const normalizedName = fullName.trim();
      const normalizedEmail = email.trim();

      await createUserProfile({
        uid: firebaseUser.uid,
        fullName: normalizedName,
        email: normalizedEmail,
        role: createdRole,
        requestedRole: selectedRole,
        isActive: !tutorNeedsApproval,
        onboardingSource: joinCode ? "registration-link" : "direct",
        registrationLinkId: joinCode || undefined,
      });

      let registrationStatus: "approved" | "pending" | null = null;
      if (joinCode && createdRole === "student") {
        registrationStatus = await claimRegistrationLink(joinCode, {
          uid: firebaseUser.uid,
          fullName: normalizedName,
          email: normalizedEmail,
          role: "student",
          requestedRole: "student",
          enrolledCourses: [],
          isActive: true,
          onboardingSource: "registration-link",
          registrationLinkId: joinCode,
        });
      }

      if (tutorNeedsApproval) {
        await logoutUser();
        alert("Tutor registration request submitted. An administrator must approve and activate the account before tutor access is granted.");
        navigate("/login?role=tutor&status=pending");
      } else if (registeringTutor) {
        try {
          await bootstrapTenantWorkspace();
        } catch (workspaceError) {
          console.warn("Tutor workspace bootstrap will retry after login.", workspaceError);
        }
        alert("Tutor account created successfully. Your Free Tutor plan is ready and you can upgrade whenever you need more capacity or advanced tools.");
        navigate("/tutor?welcome=1", { replace: true });
      } else if (registrationStatus === "approved") {
        alert("Registration and course-unit enrolment completed successfully. Your assigned learning content is now available.");
        navigate("/student/course-units", { replace: true });
      } else if (registrationStatus === "pending") {
        alert("Registration completed. Your course-unit enrolment is awaiting tutor or administrator approval.");
        navigate("/dashboard", { replace: true });
      } else {
        alert("Registration successful. Please verify your email before logging in.");
        navigate(`/login?role=${selectedRole}`);
      }
    } catch (caughtError: unknown) {
      console.error(caughtError);
      if (!(caughtError instanceof FirebaseError)) {
        setError("Registration failed. Please try again.");
      } else if (caughtError.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else if (caughtError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (caughtError.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError(caughtError.message || "Registration failed.");
      }
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
            <h1 className="mt-6 text-4xl font-extrabold text-slate-950">Register with Medical Elites</h1>
            <p className="mt-3 text-slate-600">Choose the account type you need.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roles.map(({ role, title, description, icon: Icon }) => (
              <button key={role} type="button" onClick={() => { setSelectedRole(role); setError(""); }} className={`rounded-2xl border p-5 text-left transition ${selectedRole === role ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}>
                <Icon className="text-blue-700" size={28} />
                <p className="mt-4 text-lg font-bold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </button>
            ))}
          </div>

          {selectedRole === "admin" ? (
            <Card className="mx-auto mt-8 max-w-xl text-center">
              <UserCog className="mx-auto text-blue-700" size={42} />
              <h2 className="mt-4 text-2xl font-bold text-slate-950">Administrator access is invitation-only</h2>
              <p className="mt-3 leading-7 text-slate-600">This protects institutional data and prevents unauthorized privilege creation. Contact Medical Elites or an existing administrator to request access.</p>
              <div className="mt-6"><Link to="/contact?subject=admin-access"><Button>Request Administrator Access</Button></Link></div>
            </Card>
          ) : (
            <Card className="mx-auto mt-8 w-full max-w-md">
              <h2 className="text-center text-2xl font-bold text-slate-950">{selectedRole === "student" ? "Student Registration" : "Tutor Registration"}</h2>
              {error && <div className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}
              <form onSubmit={handleRegister} className="mt-6 space-y-5">
                <label className="block"><span className="mb-2 block font-medium">Full Name</span><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>
                <label className="block"><span className="mb-2 block font-medium">Email Address</span><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
                <label className="block"><span className="mb-2 block font-medium">Password</span><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
                <label className="block"><span className="mb-2 block font-medium">Confirm Password</span><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Submitting..." : selectedRole === "student" ? "Create Student Account" : "Create Tutor Account"}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to={`/login?role=${selectedRole}`} className="font-semibold text-blue-700 hover:underline">Login</Link></p>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
