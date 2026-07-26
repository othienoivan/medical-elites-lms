import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useAuth from "../hooks/useAuth";

const reasonMessages: Record<string, string> = {
  role: "Your account does not have permission to open this area.",
  inactive: "This account has been deactivated. Contact an administrator.",
  profile: "Your account profile could not be verified. Contact an administrator.",
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const reason = searchParams.get("reason") || "role";

  const safeHome = role === "tutor" || role === "admin" ? "/tutor" : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <Card className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <LockKeyhole size={30} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-950">Access Denied</h1>
        <p className="mt-3 text-slate-600">
          {reasonMessages[reason] || reasonMessages.role}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Button onClick={() => navigate(safeHome, { replace: true })}>
            Open My Dashboard
          </Button>
        </div>
      </Card>
    </main>
  );
}
