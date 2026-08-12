import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getTutorRegistrationLinkStudents, type TutorRegistrationLinkStudent } from "../firebase/registrationLinks";

export default function TutorRegisteredLearnersPage() {
  const [students, setStudents] = useState<TutorRegistrationLinkStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setStudents(await getTutorRegistrationLinkStudents()); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load registered learners."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);
  const groups = useMemo(() => {
    const map = new Map<string, TutorRegistrationLinkStudent[]>();
    for (const student of students) {
      const key = student.registrationLinkCode || "unknown";
      map.set(key, [...(map.get(key) || []), student]);
    }
    return [...map.entries()];
  }, [students]);

  return <TutorLayout title="Registered Learners" subtitle="Students who joined using registration links created by your tutor account. These learners belong to your independent tutor workspace, not to an institution.">
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Users className="text-cyan-700"/><div><p className="text-sm text-slate-500">Total learners</p><p className="text-2xl font-black">{loading ? "…" : students.length}</p></div></div>
        <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/>{loading ? " Refreshing…" : " Refresh"}</Button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {!loading && !error && students.length === 0 && <Card className="text-center"><Users className="mx-auto text-slate-400" size={42}/><h2 className="mt-3 font-bold">No registered learners found</h2><p className="mt-1 text-sm text-slate-600">If learners joined older links, press Refresh. The server will recover legacy claims by the registration-link code and repair tutor ownership.</p></Card>}
      {groups.map(([code, learners]) => <Card key={code}>
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-black text-slate-950">{learners[0]?.registrationLinkName || "Registration link"}</h2><p className="text-xs text-slate-500">{code} · {learners.length} learner{learners.length === 1 ? "" : "s"}</p></div></div>
        <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="px-2 py-2">Learner</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Year</th><th className="px-2 py-2">Semester</th><th className="px-2 py-2">Status</th></tr></thead><tbody>{learners.map((student) => <tr key={student.enrollmentId} className="border-b last:border-0"><td className="px-2 py-3 font-semibold">{student.studentName}</td><td className="px-2 py-3">{student.studentEmail || "—"}</td><td className="px-2 py-3">{student.yearOfStudy || "—"}</td><td className="px-2 py-3">{student.semester || "—"}</td><td className="px-2 py-3">{student.approvalStatus}</td></tr>)}</tbody></table></div>
      </Card>)}
    </div>
  </TutorLayout>;
}
