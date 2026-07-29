import { Building2, GraduationCap, Link2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { claimRegistrationLink, getRegistrationLink } from "../firebase/registrationLinks";
import useAuth from "../hooks/useAuth";
import type { RegistrationLink } from "../models/RegistrationLink";

export default function JoinPage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [link, setLink] = useState<RegistrationLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    getRegistrationLink(code).then((record) => {
      setLink(record);
      if (!record) setMessage("This registration link was not found.");
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not open this registration link.")).finally(() => setLoading(false));
  }, [code]);

  async function claim() {
    if (!userProfile) return;
    setClaiming(true);
    try {
      const status = await claimRegistrationLink(code, userProfile);
      if (status === "pending") setMessage("Your request has been submitted for approval. Your existing enrollment was not overwritten.");
      else {
        setMessage("Enrollment completed. Your assigned programmes and course units are now available.");
        window.setTimeout(() => navigate("/dashboard", { replace: true }), 900);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enrollment failed.");
    } finally {
      setClaiming(false);
    }
  }

  if (loading || authLoading) return <PublicLayout><div className="p-16 text-center">Loading registration link...</div></PublicLayout>;

  return <PublicLayout><div className="bg-slate-100 px-5 py-14"><Card className="mx-auto max-w-2xl">
    <div className="text-center"><Link2 className="mx-auto text-blue-700" size={44} /><h1 className="mt-4 text-3xl font-extrabold">Join Medical Elites</h1></div>
    {message && <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">{message}</div>}
    {link && <div className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><ShieldCheck className="text-blue-700" /><p className="mt-2 text-sm text-slate-500">Tutor</p><p className="font-bold">{link.tutorName || "Institution-assigned tutor"}</p></div><div className="rounded-xl bg-slate-50 p-4"><Building2 className="text-blue-700" /><p className="mt-2 text-sm text-slate-500">Institution</p><p className="font-bold">{link.institutionName || "Medical Elites"}</p></div></div>
      <div className="rounded-xl border border-slate-200 p-4"><GraduationCap className="text-blue-700" /><p className="mt-2 font-bold">{link.programmeTitle || "Programmes assigned by the tutor or institution"}</p><p className="mt-1 text-sm text-slate-600">Academic year: {link.academicYear || "Assigned after registration"} · Year: {link.yearOfStudy || "Assigned after registration"} · Semester: {link.semester || "Assigned after registration"}</p></div>
      {!currentUser ? <div className="grid gap-3 sm:grid-cols-2"><Link to={`/register?role=student&join=${encodeURIComponent(code)}`}><Button className="w-full">Register through this link</Button></Link><Link to={`/login?role=student&join=${encodeURIComponent(code)}&redirect=${encodeURIComponent(`/join/${code}`)}`}><Button variant="secondary" className="w-full">Login and join</Button></Link></div> : userProfile?.role !== "student" ? <p className="rounded-xl bg-amber-50 p-4 text-amber-800">Only a student account can use this registration link.</p> : <Button className="w-full" onClick={claim} disabled={claiming}>{claiming ? "Connecting your account..." : "Accept and join"}</Button>}
    </div>}
  </Card></div></PublicLayout>;
}
