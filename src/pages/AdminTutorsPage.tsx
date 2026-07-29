import { CheckCircle, Search, UserCog, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getTutorAccounts, setUserActive } from "../firebase/adminUsers";
import type { AppUser } from "../models/User";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const load = useCallback(async () => { setLoading(true); try { setTutors(await getTutorAccounts()); } finally { setLoading(false); } }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);
  const filtered = useMemo(() => tutors.filter((tutor) => `${tutor.fullName} ${tutor.email}`.toLowerCase().includes(search.toLowerCase())), [tutors, search]);
  async function toggle(tutor: AppUser) { try { await setUserActive(tutor.uid, !tutor.isActive); await load(); alert(`Tutor account ${tutor.isActive ? "deactivated" : "activated"}.`); } catch (error) { console.error(error); alert("Failed to update tutor account."); } }
  return <AdminLayout title="Tutor Accounts" subtitle="Search, activate and deactivate institutional tutor accounts."><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="relative max-w-xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tutor name or email" className="pl-11"/></div>{loading ? <div className="mt-6 space-y-3">{[1,2,3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100"/>)}</div> : filtered.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center"><UserCog className="mx-auto text-slate-400"/><p className="mt-3 font-semibold text-slate-700">No tutor accounts found.</p></div> : <div className="mt-6 space-y-3">{filtered.map((tutor) => <article key={tutor.uid} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h2 className="font-bold text-slate-950">{tutor.fullName}</h2>{tutor.isActive ? <CheckCircle className="text-emerald-600" size={18}/> : <XCircle className="text-red-600" size={18}/>}</div><p className="mt-1 text-sm text-slate-500">{tutor.email}</p></div><Button size="sm" variant={tutor.isActive ? "danger" : "success"} onClick={() => void toggle(tutor)}>{tutor.isActive ? "Deactivate" : "Activate"}</Button></article>)}</div>}</div></AdminLayout>;
}
