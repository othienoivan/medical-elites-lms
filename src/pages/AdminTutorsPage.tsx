import { Building2, CheckCircle, Search, Unlink, UserCog, UserRoundCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getInstitutionTutorMemberships, removeTutorFromInstitution, setInstitutionTutorAccess, type InstitutionTutorMembership } from "../firebase/adminInstitutionTutors";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<InstitutionTutorMembership[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await getInstitutionTutorMemberships(); setTenantId(result.tenantId); setTutors(result.items); }
    catch (cause) { console.error("Failed to load institution tutor memberships:", cause); setError(cause instanceof Error ? cause.message : "Unable to load institution tutors."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => tutors.filter((tutor) => `${tutor.fullName} ${tutor.email}`.toLowerCase().includes(search.toLowerCase())), [tutors, search]);

  async function toggle(tutor: InstitutionTutorMembership) {
    setBusyUid(tutor.tutorUid);
    try { await setInstitutionTutorAccess(tutor.tutorUid, tutor.status === "active" ? "inactive" : "active"); await load(); }
    catch (cause) { console.error(cause); alert("Failed to update institution access. The tutor's platform account was not changed."); }
    finally { setBusyUid(null); }
  }

  async function remove(tutor: InstitutionTutorMembership) {
    if (!window.confirm(`Remove ${tutor.fullName} from this institution?\n\nThis removes only the institution relationship. Their Medical Elites tutor account, independent workspace, courses, products, wallet, sales and platform records will remain.`)) return;
    setBusyUid(tutor.tutorUid);
    try { await removeTutorFromInstitution(tutor.tutorUid); await load(); alert("Tutor removed from the institution. Their Medical Elites account remains active as an independent tutor."); }
    catch (cause) { console.error(cause); alert("Failed to remove the tutor from this institution."); }
    finally { setBusyUid(null); }
  }

  return <AdminLayout title="Institution Tutors" subtitle="Manage institution membership without deleting tutors from Medical Elites.">
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search institutional tutor" className="pl-11"/></div>
        {tenantId && <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"><Building2 size={15}/> Institution workspace: {tenantId}</div>}
      </div>
      <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900"><strong>Institution membership is separate from the platform account.</strong> Deactivating or removing a tutor here does not delete their account, independent workspace, marketplace products, courses, earnings or sales history.</div>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <div className="mt-6 space-y-3">{[1,2,3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100"/>)}</div>
      : filtered.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center"><UserCog className="mx-auto text-slate-400"/><p className="mt-3 font-semibold text-slate-700">No tutors are currently linked to this institution.</p><p className="mt-1 text-sm text-slate-500">Independent platform tutors are not automatically institution tutors.</p></div>
      : <div className="mt-6 space-y-3">{filtered.map((tutor) => { const active=tutor.status==="active"; return <article key={tutor.membershipId} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-950">{tutor.fullName}</h2>{active?<CheckCircle className="text-emerald-600" size={18}/>:<XCircle className="text-amber-600" size={18}/>}<span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{active?"Institution access active":"Institution access inactive"}</span>{tutor.independent&&<span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">Independent platform tutor</span>}</div><p className="mt-1 text-sm text-slate-500">{tutor.email}</p>{tutor.independent&&<p className="mt-2 text-sm text-violet-700">This independent tutor still has a legacy institution link. It is safe to remove that link.</p>}</div><div className="flex flex-col gap-2 sm:flex-row">{!tutor.independent&&<Button size="sm" variant={active?"secondary":"success"} disabled={busyUid===tutor.tutorUid} onClick={()=>void toggle(tutor)}><UserRoundCheck size={16}/>{active?"Deactivate Institution Access":"Activate Institution Access"}</Button>}<Button size="sm" variant="danger" disabled={busyUid===tutor.tutorUid} onClick={()=>void remove(tutor)}><Unlink size={16}/>Remove from Institution</Button></div></div></article>; })}</div>}
    </div>
  </AdminLayout>;
}
